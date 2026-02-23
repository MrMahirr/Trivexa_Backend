import { DepartmentsRepository } from './department.repository';

describe('DepartmentsRepository', () => {
  let repository: DepartmentsRepository;

  beforeEach(() => {
    repository = new DepartmentsRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all departments from enum', async () => {
      const departments = await repository.findAll();

      expect(departments.length).toBeGreaterThan(0);
      expect(departments[0]).toHaveProperty('id');
      expect(departments[0]).toHaveProperty('name');
    });
  });

  describe('findById', () => {
    it('should return department when valid id', async () => {
      const departments = await repository.findAll();
      const firstId = departments[0].id;

      const dept = await repository.findById(firstId);

      expect(dept).not.toBeNull();
      expect(dept?.id).toBe(firstId);
    });

    it('should return null for invalid id', async () => {
      const dept = await repository.findById('NONEXISTENT_DEPT');

      expect(dept).toBeNull();
    });
  });
});
