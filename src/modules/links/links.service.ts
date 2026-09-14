import { Injectable } from '@nestjs/common';

@Injectable()
export class LinksService {
  getStatus() {
    return { status: 'links-ready' };
  }
}
