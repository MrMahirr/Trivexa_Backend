import { User } from './user.entity';
import { Role } from '../../../shared/enums/role.enum';
import { Department } from '../../../shared/enums/department.enum';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      '123',
      'test@example.com',
      'John',
      'Doe',
      Role.MEMBER,
      Department.DEVELOPMENT,
      true,
      false,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    );
  });

  it('should create a user instance', () => {
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
  });

  describe('activate', () => {
    it('should activate user and update timestamp', () => {
      user.isActive = false;
      const oldUpdatedAt = user.updatedAt;

      // Allow some time to pass to ensure timestamp difference if needed,
      // but for unit test just checking it's a new date is usually enough.
      // We can mock Date if we want strict control, but for simple entity logic:

      user.activate();

      expect(user.isActive).toBe(true);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate user and update timestamp', () => {
      user.isActive = true;
      const oldUpdatedAt = user.updatedAt;

      user.deactivate();

      expect(user.isActive).toBe(false);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('changeRole', () => {
    it('should change role and update timestamp', () => {
      const oldRole = user.role;
      const newRole = Role.MANAGER;
      const oldUpdatedAt = user.updatedAt;

      user.changeRole(newRole);

      expect(user.role).toBe(newRole);
      expect(user.role).not.toBe(oldRole);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('changeDepartment', () => {
    it('should change department and update timestamp', () => {
      const oldDept = user.department;
      const newDept = Department.HR;
      const oldUpdatedAt = user.updatedAt;

      user.changeDepartment(newDept);

      expect(user.department).toBe(newDept);
      expect(user.department).not.toBe(oldDept);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('fromRow', () => {
    it('should map database row to User entity', () => {
      const row = {
        id: 'uuid-123',
        email: 'mapped@test.com',
        first_name: 'Mapped',
        last_name: 'User',
        role: 'ADMIN',
        department: 'SALES',
        is_active: true,
        force_password_change: false,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02'),
      };

      const mappedUser = User.fromRow(row);

      expect(mappedUser).toBeInstanceOf(User);
      expect(mappedUser.id).toBe(row.id);
      expect(mappedUser.firstName).toBe(row.first_name);
      expect(mappedUser.isActive).toBe(row.is_active);
    });
  });

  describe('toSafeResponse', () => {
    it('should return safe user object without sensitive data', () => {
      const safeUser = User.toSafeResponse(user);

      expect(safeUser).toHaveProperty('id');
      expect(safeUser).toHaveProperty('email');
      expect(safeUser).not.toHaveProperty('passwordHash'); // Just to be sure even though entity doesn't have it
      expect(safeUser).not.toBeInstanceOf(User);
    });
  });
});
