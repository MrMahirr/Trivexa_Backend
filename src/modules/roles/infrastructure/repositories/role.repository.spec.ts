import { RolesRepository } from './role.repository';

describe('RolesRepository', () => {
  let repository: RolesRepository;

  beforeEach(() => {
    repository = new RolesRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles from enum', async () => {
      const roles = await repository.findAll();

      expect(roles.length).toBeGreaterThan(0);
      expect(roles[0]).toHaveProperty('id');
      expect(roles[0]).toHaveProperty('name');
      expect(roles[0]).toHaveProperty('description');
    });
  });

  describe('findById', () => {
    it('should return a role when valid id is given', async () => {
      const role = await repository.findById('ADMIN');

      expect(role).not.toBeNull();
      expect(role?.id).toBe('ADMIN');
    });

    it('should return null for invalid role id', async () => {
      const role = await repository.findById('NONEXISTENT');

      expect(role).toBeNull();
    });
  });
});
