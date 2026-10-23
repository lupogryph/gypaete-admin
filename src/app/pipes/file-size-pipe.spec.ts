import {FileSizePipe} from './file-size-pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('rounds values up to a whole KB by default', () => {
    expect(pipe.transform(1)).toBe('1 KB');
    expect(pipe.transform(1.01)).toBe('2 KB');
  });

  it('converts values of 1024 KB or greater to MB and GB', () => {
    expect(pipe.transform(1024)).toBe('1 MB');
    expect(pipe.transform(1024.1)).toBe('2 MB');
    expect(pipe.transform(1536)).toBe('2 MB');
    expect(pipe.transform(1024 ** 2)).toBe('1 GB');
  });

  it('keeps values below 1024 in KB', () => {
    expect(pipe.transform(1023.999)).toBe('1024 KB');
  });
});
