import {Expose} from 'class-transformer';

export class BlogCommentRdo {
  @Expose()
  public id!: string;

  @Expose()
  public userId!: string;

  @Expose()
  public postId!: string;

  @Expose()
  public text!: string;

  @Expose()
  public createdAt!: Date;
}
