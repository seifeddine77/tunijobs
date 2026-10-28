import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('TuniJobsAPI');

  // Sécurité des en-têtes HTTP (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Préserve le chargement de Swagger UI
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Parsing des cookies sécurisés HttpOnly
  app.use(cookieParser());

  // Préfixe global des routes API
  app.setGlobalPrefix('api/v1');

  // CORS pour le frontend Next.js
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Filtre d'exceptions unifié
  app.useGlobalFilters(new HttpExceptionFilter());

  // Documentation OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('TuniJobs API')
    .setDescription(
      'Documentation officielle de l\'API REST TuniJobs : Recrutement, IA et Cartographie pour la Tunisie',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification JWT, rôles et gestion de session')
    .addTag('Candidats', 'Profil candidat, compétences et préférences')
    .addTag('Entreprises', 'Profil entreprise et matricule fiscal tunisien')
    .addTag('Offres d\'emploi', 'CRUD offres, recherche multi-critères')
    .addTag('Cartographie & Gouvernorats', 'Données géographiques des 24 gouvernorats')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 TuniJobs API démarrée sur http://localhost:${port}/api/v1`);
  logger.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/docs`);
}

bootstrap();
