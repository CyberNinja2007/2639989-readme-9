import {Module} from '@nestjs/common';

import {BlogPostController} from './blog-post.controller';
import {BlogPostService} from './blog-post.service';
import {BlogPostRepository} from './blog-post.repository';
import {BlogPostFactory} from './blog-post.factory';
import {PrismaClientModule} from "@project/blog-models";

@Module({
  imports: [PrismaClientModule],
  controllers: [BlogPostController],
  providers: [
    BlogPostService,
    BlogPostRepository,
    BlogPostFactory
  ],
  exports: [BlogPostService],
})
export class BlogPostModule {
}
