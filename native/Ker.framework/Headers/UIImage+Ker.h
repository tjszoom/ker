//
//  UIImage+Ker.h
//  Ker
//
//  Created by hailong11 on 2018/12/10.
//  Copyright © 2018 kkmofang.cn. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef void (^UIImageKerCallback)(UIImage * image,NSError * err);

@interface UIImage (Ker)

+(NSString *) ker_keyWithURI:(NSString *) URI;

+(NSString *) ker_pathWithURI:(NSString *) URI basePath:(NSString *) basePath;

+(UIImage *) ker_imageWithURI:(NSString *) URI basePath:(NSString *) basePath;

+(UIImage *) ker_imageByCacheWithURI:(NSString *) URI basePath:(NSString *) basePath;

+(void) ker_imageWithURI:(NSString *) URI basePath:(NSString *) basePath callback:(UIImageKerCallback) callback queue:(dispatch_queue_t) queue;

@end

