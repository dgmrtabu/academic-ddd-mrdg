export class Student {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public document: string,
    public birthDate: Date,
    public readonly code: string,
    public userId: string,
  ) {}
}
