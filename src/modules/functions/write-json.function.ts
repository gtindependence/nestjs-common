import { promises } from 'fs';

export async function writeJson(path: string, content: Parameters<typeof promises.writeFile>[1]) {
    const { writeFile } = promises;
    await writeFile(path, content);
}
