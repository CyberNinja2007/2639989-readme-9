import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {getMongooseOptions, NotifyConfigModule} from "@project/notify-config";
import {EmailSubscriberModule} from '@project/email-subscriber';

@Module({
  imports: [
    MongooseModule.forRootAsync(getMongooseOptions()),
    NotifyConfigModule,
    EmailSubscriberModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
