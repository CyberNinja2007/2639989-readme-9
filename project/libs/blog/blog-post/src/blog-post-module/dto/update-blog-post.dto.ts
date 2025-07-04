import {ApiPropertyOptional} from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer';
import {
  AvailablePostStatus,
  AvailablePostType,
  MAX_TAGS_PER_POST,
  PostValidateMessage,
  TAG_REGEX,
  TagLength
} from '../blog-post.constant';
import {UpdateTextPayloadDto} from './payloads/update-text-payload.dto';
import {UpdateVideoPayloadDto} from './payloads/update-video-payload.dto';
import {UpdateQuotePayloadDto} from './payloads/update-quote-payload.dto';
import {UpdatePhotoPayloadDto} from './payloads/update-photo-payload.dto';
import {UpdateLinkPayloadDto} from './payloads/update-link-payload.dto';
import {PostStatus} from "@project/core";

export class UpdateBlogPostDto {
  @ApiPropertyOptional({
    description: 'Обновленный контент публикации'
  })
  @ValidateNested()
  @IsOptional()
  @Type(({object}) => {
    if (!object || !object.type) return null;
    switch (object.type) {
      case AvailablePostType.TEXT:
        return UpdateTextPayloadDto;
      case AvailablePostType.VIDEO:
        return UpdateVideoPayloadDto;
      case AvailablePostType.QUOTE:
        return UpdateQuotePayloadDto;
      case AvailablePostType.PHOTO:
        return UpdatePhotoPayloadDto;
      case AvailablePostType.LINK:
        return UpdateLinkPayloadDto;
      default:
        return null;
    }
  })
  public payload?:
    | UpdateTextPayloadDto
    | UpdateVideoPayloadDto
    | UpdateQuotePayloadDto
    | UpdatePhotoPayloadDto
    | UpdateLinkPayloadDto;

  @ApiPropertyOptional({
    enum: AvailablePostStatus,
    description: 'Новый статус публикации',
    example: AvailablePostStatus.PUBLISHED
  })
  @IsEnum(AvailablePostStatus, {
    message: PostValidateMessage.StatusNotValid
  })
  @IsOptional()
  public status?: PostStatus;

  @ApiPropertyOptional({
    description: 'Обновленные теги публикации',
    example: ['новое', 'обновление'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TAGS_PER_POST, {
    message: PostValidateMessage.TooManyTags
  })
  @Matches(TAG_REGEX, {
    each: true,
    message: PostValidateMessage.TagPatternNotValid
  })
  @MinLength(TagLength.Min, {
    each: true,
    message: PostValidateMessage.TagMinLengthNotValid
  })
  @MaxLength(TagLength.Max, {
    each: true,
    message: PostValidateMessage.TagMaxLengthNotValid
  })
  public tags?: string[];

  @ApiPropertyOptional({
    description: 'Сбросить количество репостов? (только для владельца)',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  public resetRepostCount?: boolean = false;
}
