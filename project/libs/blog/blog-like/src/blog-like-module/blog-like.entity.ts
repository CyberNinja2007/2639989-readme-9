import {Entity, Like, StorableEntity} from '@project/core';

export class BlogLikeEntity extends Entity implements StorableEntity<Like> {
  public userId!: string;
  public postId!: string;
  public createdAt!: Date;

  constructor(like?: Like) {
    super();
    this.populate(like);
  }

  public populate(like?: Like) {
    if (!like) {
      return;
    }
    this.userId = like.userId;
    this.postId = like.postId;
    this.createdAt = like.createdAt!;
  }

  public toPOJO(): Like {
    return {
      userId: this.userId,
      postId: this.postId,
      createdAt: this.createdAt,
    };
  }
}
