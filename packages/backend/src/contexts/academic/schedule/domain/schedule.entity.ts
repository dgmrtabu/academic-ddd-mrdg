export class Schedule {
  constructor(
    public readonly id: string,
    public studentId: string,
    public courseId: string,
    public slot: string,
  ) {}
}
