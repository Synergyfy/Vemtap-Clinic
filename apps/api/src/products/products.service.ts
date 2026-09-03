import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto): Promise<Product[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.category) where.category = query.category;
    if (query.search) where.name = Like(`%${query.search}%`);
    return this.productRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getLowStock(clinicId: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.clinicId = :clinicId', { clinicId })
      .andWhere('product.quantityInStock <= product.reorderLevel')
      .getMany();
  }
}
