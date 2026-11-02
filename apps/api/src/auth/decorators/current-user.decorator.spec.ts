import { plainToInstance } from 'class-transformer';
import { RegisterDto } from '../dto/auth.dto';
import { sanitizeCurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('strips circular and sensitive fields from the request user object', () => {
    const user: any = {
      sub: 'user-123',
      email: 'staff@example.com',
      password: 'secret',
      clinic: {
        id: 'clinic-123',
      },
    };

    user.clinic.owner = user;

    const result = sanitizeCurrentUser(user);

    expect(result).toMatchObject({
      sub: 'user-123',
      email: 'staff@example.com',
    });
    expect(result.clinic).toBeUndefined();
    expect(result.password).toBeUndefined();
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('drops empty clinicId values when the register payload is transformed', () => {
    const dto = plainToInstance(RegisterDto, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      clinicId: '',
    });

    expect(dto.clinicId).toBeUndefined();
  });

  it('removes socket references from request user objects before JSON serialization', () => {
    const socket: any = { parser: {} };
    socket.parser.socket = socket;

    const user: any = {
      sub: 'user-123',
      email: 'staff@example.com',
      socket,
    };

    const result = sanitizeCurrentUser(user);

    expect(result.socket).toBeUndefined();
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});
