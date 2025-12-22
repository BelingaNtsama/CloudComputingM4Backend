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
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AnnouncesService {
  constructor(
    @InjectRepository(Announce)
    private readonly announceRepo: Repository<Announce>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    createAnnounceDto: CreateAnnounceDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Announce> {
    let imageUrl: string | null = null;

    if (file) {
      const supabase = this.supabaseService.getClient();
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      const { error } = await supabase.storage
        .from('cloud') // nom du bucket Supabase
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('cloud').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const announce = this.announceRepo.create({
      ...createAnnounceDto,
      uploadedImages: imageUrl ? [imageUrl] : [],
      userId,
    });

    return await this.announceRepo.save(announce);
  }

  async findAll(): Promise<Announce[]> {
    return await this.announceRepo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Announce> {
    const announce = await this.announceRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!announce) throw new NotFoundException(`Annonce #${id} introuvable`);
    return announce;
  }

  async update(
    id: number,
    updateAnnounceDto: UpdateAnnounceDto,
    userId: number,
  ): Promise<Announce> {
    const announce = await this.findOne(id);
    if (announce.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces',
      );
    }
    Object.assign(announce, updateAnnounceDto);
    return await this.announceRepo.save(announce);
  }

  async remove(id: number, userId: number): Promise<string> {
    const announce = await this.findOne(id);
    if (announce.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces',
      );
    }
    await this.announceRepo.remove(announce);
    return `Annonce #${id} supprimée avec succès`;
  }
}
