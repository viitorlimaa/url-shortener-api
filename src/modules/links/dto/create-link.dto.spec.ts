import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLinkDto } from './create-link.dto.js';

describe('CreateLinkDto', () => {
  it('normalizes a custom code to lowercase and trims whitespace', async () => {
    const dto = plainToInstance(CreateLinkDto, {
      original: 'https://example.com/page',
      customCode: ' Meu-Artigo ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.customCode).toBe('meu-artigo');
  });

  it.each([
    ['too short', 'ab'],
    ['spaces', 'meu artigo'],
    ['leading hyphen', '-meu-artigo'],
    ['trailing hyphen', 'meu-artigo-'],
    ['repeated hyphens', 'meu--artigo'],
    ['over 50 characters', 'a'.repeat(51)],
  ])('rejects a custom code with %s', async (_case, customCode) => {
    const dto = plainToInstance(CreateLinkDto, {
      original: 'https://example.com/page',
      customCode,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'customCode')).toBe(true);
  });

  it('allows omitting the custom code', async () => {
    const dto = plainToInstance(CreateLinkDto, {
      original: 'https://example.com/page',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
