import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {BlogPostRepository} from './blog-post.repository';
import {BlogPostEntity} from './blog-post.entity';
import {CreateBlogPostDto} from './dto/create-blog-post.dto';
import {UpdateBlogPostDto} from './dto/update-blog-post.dto';
import {PaginationResult} from '@project/core';
import {BlogTagService} from '@project/blog-tag';
import {AvailablePostType, MAX_POSTS_LIMIT, PostStatus, PostValidateMessage} from './blog-post.constant';
import {BlogPostQuery} from "./blog-post.query";
import {patchPayloadByType} from "./patch-payload.util";

@Injectable()
export class BlogPostService {
  constructor(
    private readonly blogPostRepository: BlogPostRepository,
    private readonly blogTagService: BlogTagService
  ) {
  }

  public async getPosts(
    query: BlogPostQuery = {},
    userId?: string,
    includeDrafts: boolean = false
  ): Promise<PaginationResult<BlogPostEntity>> {
    try {
      const filter = {
        ...query,
        status: includeDrafts ? undefined : PostStatus.PUBLISHED,
        authorId: userId
      };

      return await this.blogPostRepository.find(filter);
    } catch (err) {
      throw new InternalServerErrorException('Не удалось загрузить посты');
    }
  }

  public async getPostsByPeriod(
    startDate: Date,
    userId: string
  ): Promise<BlogPostEntity[]> {
    try {
      const filter = {
        startDate: startDate,
        status: PostStatus.PUBLISHED,
        authorId: userId
      };

      const paginationResult = await this.blogPostRepository.find(filter);

      return paginationResult.entities;
    } catch (err) {
      throw new InternalServerErrorException('Не удалось загрузить посты за период');
    }
  }

  public async getPost(
    id: string,
  ): Promise<BlogPostEntity> {
    try {
      return await this.blogPostRepository.findById(id);
    } catch (err) {
      throw new NotFoundException(`Пост с ID ${id} не найден`);
    }
  }

  public async createPost(userId: string, dto: CreateBlogPostDto, photoId?: string): Promise<BlogPostEntity> {
    if (dto.isRepost && !dto.originalPostId) {
      throw new BadRequestException(
        'Для репоста необходимо указать оригинальный пост'
      );
    }

    if (dto.originalPostId) {
      try {
        const post = await this.getPost(dto.originalPostId);

        if (post.id === dto.originalPostId) {
          throw new ConflictException('Нельзя репостить свой собственный пост');
        }

        const userPosts =
          await this.blogPostRepository.find({originalPostId: post.id, includeReposts: true});

        if (userPosts.entities.length > 0) {
          throw new ConflictException('Вы не можете репостить этот пост больше одного раза');
        }

      } catch {
        throw new NotFoundException(
          `Оригинальный пост с ID ${dto.originalPostId} не найден`
        );
      }
    }

    const tags = [];
    if (dto.tags && dto.tags.length > 0) {
      for (const tag of dto.tags) {
        this.blogTagService.validateTagName(tag);
      }
      const dbTags = await this.blogTagService.getTagsByIds(dto.tags);
      tags.push(...dbTags);
    }

    const entity = new BlogPostEntity({...dto, userId, tags});

    if (entity.type === AvailablePostType.PHOTO && !photoId)
      throw new BadRequestException(PostValidateMessage.PhotoNecessary);

    if (entity.type === AvailablePostType.PHOTO)
      entity.payload.fileId = photoId;

    try {
      await this.blogPostRepository.save(entity);
      return entity;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException('Конфликт данных при создании поста');
      }
      throw new InternalServerErrorException('Не удалось создать пост');
    }
  }

  public async updatePost(
    id: string,
    userId: string,
    dto: UpdateBlogPostDto,
    photoId?: string
  ): Promise<BlogPostEntity> {
    const existing = await this.getPost(id);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой пост');
    }

    if (dto.tags && dto.tags.length > 0) {
      for (const tag of dto.tags) {
        this.blogTagService.validateTagName(tag);
      }
      existing.tags = await this.blogTagService.getTagsByIds(dto.tags);
    }

    if (dto.payload !== undefined) {
      existing.payload = patchPayloadByType(
        existing.type,
        existing.payload,
        dto.payload,
        photoId
      );
    }

    if (dto.status !== undefined) {
      existing.status = dto.status;
      if (dto.status === PostStatus.PUBLISHED && !existing.publishedAt) {
        existing.publishedAt = new Date();
      } else if (dto.status === PostStatus.DRAFT && existing.publishedAt) {
        existing.publishedAt = null;
      }
    }

    try {
      await this.blogPostRepository.update(existing)

      return existing;
    } catch (err) {
      throw new InternalServerErrorException('Не удалось обновить пост');
    }
  }

  public async deletePost(id: string, userId: string): Promise<void> {
    try {
      const post = await this.blogPostRepository.findById(id);

      if (post.authorId !== userId) {
        throw new ForbiddenException('Нельзя удалить чужой пост');
      }

      await this.blogPostRepository.deleteById(id);
    } catch (err) {
      throw new InternalServerErrorException('Не удалось удалить пост');
    }
  }

  public async getUserLatestPosts(
    userId: string,
    limit = MAX_POSTS_LIMIT
  ): Promise<BlogPostEntity[]> {
    try {
      return await this.blogPostRepository.findRelatedPosts(userId, limit);
    } catch (err) {
      throw new InternalServerErrorException(
        'Не удалось загрузить последние публикации пользователя'
      );
    }
  }

  public async getPostsByIds(ids: string[]): Promise<BlogPostEntity[]> {
    try {
      return await this.blogPostRepository.findByIds(ids);
    } catch (err) {
      throw new InternalServerErrorException('Не удалось загрузить посты');
    }
  }
}
