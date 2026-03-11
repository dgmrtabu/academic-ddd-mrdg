export class Student {
  constructor(
    public readonly id: string,
    public name: string,
    public document: string,
    public birthDate: Date,
    public readonly code: string,
  ) {}
}
