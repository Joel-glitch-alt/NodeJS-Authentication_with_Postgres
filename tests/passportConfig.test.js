const mockQuery = jest.fn();

jest.mock("../dbConfig", () => ({
  pool: {
    query: mockQuery,
  },
}));

const passport = require("passport");
const bcrypt = require("bcryptjs"); // Using bcryptjs
const initialize = require("../passportConfig");

// Mock the entire dbConfig module and its pool.query metho

// Initialize passport local strategy after mocks
initialize(passport);

describe("Passport LocalStrategy", () => {
  let strategy;
  let originalSuccess;
  let originalFail;
  let originalError;

  beforeAll(() => {
    strategy = passport._strategies.local;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Save original methods
    originalSuccess = strategy.success;
    originalFail = strategy.fail;
    originalError = strategy.error;
  });

  afterEach(() => {
    // Restore original methods
    strategy.success = originalSuccess;
    strategy.fail = originalFail;
    strategy.error = originalError;
  });

  it("should authenticate with correct credentials", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 10), // Hashed password
    };

    // Mock DB query to return the user
    mockQuery.mockImplementation((sql, params, callback) => {
      if (sql.includes("SELECT * FROM users WHERE email")) {
        return callback(null, { rows: [mockUser] });
      }
    });

    // Override strategy callbacks
    strategy.success = (user) => {
      try {
        expect(user.email).toBe(mockUser.email);
        expect(user.id).toBe(mockUser.id);
        done();
      } catch (err) {
        done(err);
      }
    };

    strategy.fail = (info) => {
      done(
        new Error(
          `Authentication should have succeeded: ${JSON.stringify(info)}`
        )
      );
    };

    strategy.error = (err) => {
      done(err);
    };

    // Create mock req object with body
    const req = {
      body: { email: mockUser.email, password: "password123" },
    };

    strategy.authenticate(req);
  });

  it("should fail when email is not registered", (done) => {
    // Mock DB query returns no users
    mockQuery.mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [] });
    });

    strategy.success = () => {
      done(new Error("Should not authenticate"));
    };

    strategy.fail = (info) => {
      try {
        expect(info.message).toBe("Email is not registered");
        done();
      } catch (err) {
        done(err);
      }
    };

    strategy.error = (err) => {
      done(err);
    };

    const req = {
      body: { email: "nonexistent@example.com", password: "whatever" },
    };

    strategy.authenticate(req);
  });

  it("should fail with incorrect password", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("rightpassword", 10),
    };

    mockQuery.mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [mockUser] });
    });

    strategy.success = () => {
      done(new Error("Should not authenticate"));
    };

    strategy.fail = (info) => {
      try {
        expect(info.message).toBe("Password not correct!");
        done();
      } catch (err) {
        done(err);
      }
    };

    strategy.error = (err) => {
      done(err);
    };

    const req = {
      body: { email: mockUser.email, password: "wrongpassword" },
    };

    strategy.authenticate(req);
  });
});
