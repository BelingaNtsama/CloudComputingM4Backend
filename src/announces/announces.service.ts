import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announce } from './entities/announce.entity';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class AnnouncesService {
  private readonly announcesRequestsTotal: Counter<string>;
  private readonly announcesRequestDuration: Histogram<string>;

  constructor(
    @InjectRepository(Announce)
    private readonly announceRepo: Repository<Announce>,
  ) {
    this.announcesRequestsTotal = new Counter({
      name: 'announces_requests_total',
      help: 'Nombre total de requêtes Announces',
      labelNames: ['method', 'route', 'status'],
    });

    this.announcesRequestDuration = new Histogram({
      name: 'announces_request_duration_ms',
      help: 'Durée des requêtes Announces en ms',
      labelNames: ['method', 'route'],
      buckets: [50, 100, 200, 500, 1000],
    });
  }

  async create(
    createAnnounceDto: CreateAnnounceDto,
    userId: number,
  ): Promise<Announce> {
    const start = Date.now();
    try {
      const imageUrls = createAnnounceDto.uploadedImages?.map((img) => img.url);

      const announce = this.announceRepo.create({
        ...createAnnounceDto,
        uploadedImages: imageUrls,
        userId, // plus simple que caster user
      });

      const saved = await this.announceRepo.save(announce);

      this.announcesRequestsTotal.inc({
        method: 'POST',
        route: '/announces',
        status: '201',
      });
      this.announcesRequestDuration.observe(
        { method: 'POST', route: '/announces' },
        Date.now() - start,
      );

      return saved;
    } catch (err) {
      this.announcesRequestsTotal.inc({
        method: 'POST',
        route: '/announces',
        status: '500',
      });
      this.announcesRequestDuration.observe(
        { method: 'POST', route: '/announces' },
        Date.now() - start,
      );
      throw err;
    }
  }

  async findAll(): Promise<Announce[]> {
    const start = Date.now();
    const announces = await this.announceRepo.find({ relations: ['user'] });

    this.announcesRequestsTotal.inc({
      method: 'GET',
      route: '/announces',
      status: '200',
    });
    this.announcesRequestDuration.observe(
      { method: 'GET', route: '/announces' },
      Date.now() - start,
    );

    return announces;
  }

  async findOne(id: number): Promise<Announce> {
    const start = Date.now();
    const announce = await this.announceRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!announce) {
      this.announcesRequestsTotal.inc({
        method: 'GET',
        route: '/announces/:id',
        status: '404',
      });
      this.announcesRequestDuration.observe(
        { method: 'GET', route: '/announces/:id' },
        Date.now() - start,
      );
      throw new NotFoundException(`Annonce #${id} introuvable`);
    }

    this.announcesRequestsTotal.inc({
      method: 'GET',
      route: '/announces/:id',
      status: '200',
    });
    this.announcesRequestDuration.observe(
      { method: 'GET', route: '/announces/:id' },
      Date.now() - start,
    );

    return announce;
  }

  async update(
    id: number,
    updateAnnounceDto: UpdateAnnounceDto,
    userId: number,
  ): Promise<Announce> {
    const start = Date.now();
    const announce = await this.findOne(id);

    if (announce.userId !== userId) {
      this.announcesRequestsTotal.inc({
        method: 'PATCH',
        route: '/announces/:id',
        status: '403',
      });
      this.announcesRequestDuration.observe(
        { method: 'PATCH', route: '/announces/:id' },
        Date.now() - start,
      );
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces',
      );
    }

    if (updateAnnounceDto.uploadedImages) {
      updateAnnounceDto.uploadedImages = updateAnnounceDto.uploadedImages.map(
        (img: any) => img.url,
      ) as any;
    }

    Object.assign(announce, updateAnnounceDto);
    const updated = await this.announceRepo.save(announce);

    this.announcesRequestsTotal.inc({
      method: 'PATCH',
      route: '/announces/:id',
      status: '200',
    });
    this.announcesRequestDuration.observe(
      { method: 'PATCH', route: '/announces/:id' },
      Date.now() - start,
    );

    return updated;
  }

  async remove(id: number, userId: number): Promise<string> {
    const start = Date.now();
    const announce = await this.findOne(id);

    if (announce.userId !== userId) {
      this.announcesRequestsTotal.inc({
        method: 'DELETE',
        route: '/announces/:id',
        status: '403',
      });
      this.announcesRequestDuration.observe(
        { method: 'DELETE', route: '/announces/:id' },
        Date.now() - start,
      );
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces',
      );
    }

    await this.announceRepo.remove(announce);

    this.announcesRequestsTotal.inc({
      method: 'DELETE',
      route: '/announces/:id',
      status: '200',
    });
    this.announcesRequestDuration.observe(
      { method: 'DELETE', route: '/announces/:id' },
      Date.now() - start,
    );

    return `Annonce #${id} supprimée avec succès`;
  }
}
