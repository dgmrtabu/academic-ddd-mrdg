export class Course {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public credits: number,
  ) {}
}
