// Since we don't have a generic Repository interface yet, we will create generic mock helpers.

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory = <T = any>(): MockType<T> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add specific methods as needed by the repository being mocked
} as unknown as MockType<T>);

export const mockProvider = (provide: any, methods: string[] = []) => {
    const mock: any = {};
    methods.forEach(method => {
        mock[method] = jest.fn();
    });
    return {
        provide,
        useValue: mock,
    };
};
