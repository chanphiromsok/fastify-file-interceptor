import { DynamicModule, Module, Provider } from "@nestjs/common";
import {
  MULTER_MODULE_OPTIONS,
  MULTER_MODULE_ID,
} from "../constant/multer-module-option";
import {
  MulterModuleAsyncOptions,
  MulterModuleOptions,
  MulterOptionsFactory,
} from "../interface/fastify-multer-module-interface";
import { randomStringGenerator } from "../utils/random-generator";

@Module({})
export class FastifyMulterModule {
  static register(options: MulterModuleOptions = {}): DynamicModule {
    return {
      module: FastifyMulterModule,
      providers: [
        { provide: MULTER_MODULE_OPTIONS, useValue: options },
        {
          provide: MULTER_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
      exports: [MULTER_MODULE_OPTIONS],
    };
  }

  static registerAsync(options: MulterModuleAsyncOptions): DynamicModule {
    return {
      module: FastifyMulterModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: MULTER_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
      exports: [MULTER_MODULE_OPTIONS],
    };
  }

  private static createAsyncProviders(
    options: MulterModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MulterModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MULTER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: MULTER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MulterOptionsFactory) =>
        optionsFactory.createMulterOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
