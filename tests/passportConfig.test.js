const passport = require("passport");
const bcrypt = require("bcryptjs"); // Changed to bcryptjs
const initialize = require("../passportConfig");

// Mock the entire dbConfig module
const mockQuery = jest.fn();
jest.mock("../dbConfig", () => ({
  pool: {
    query: mockQuery,
  },
}));

// Setup Passport after mocking
initialize(passport);

describe("Passport LocalStrategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate with correct credentials", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 10),
    };

    // Mock DB query to return user
    mockQuery.mockImplementation((sql, params, callback) => {
      if (sql.includes("SELECT * FROM users WHERE email")) {
        return callback(null, { rows: [mockUser] });
      }
    });

    const strategy = passport._strategies.local;

    // Create mock request object
    const req = {
      body: { email: mockUser.email, password: "password123" },
    };

    // Override strategy methods for testing
    const originalSuccess = strategy.success;
    const originalFail = strategy.fail;
    const originalError = strategy.error;

    strategy.success = (user) => {
      expect(user.email).toBe(mockUser.email);
      expect(user.id).toBe(mockUser.id);

      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done();
    };

    strategy.fail = (info) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(
        new Error(
          `Authentication should have succeeded: ${JSON.stringify(info)}`
        )
      );
    };

    strategy.error = (err) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(err);
    };

    // Trigger authentication
    strategy.authenticate(req);
  });

  it("should fail when email is not registered", (done) => {
    // Mock DB query to return no users
    mockQuery.mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [] }); // No user found
    });

    const strategy = passport._strategies.local;

    const req = {
      body: { email: "nonexistent@example.com", password: "whatever" },
    };

    // Override strategy methods for testing
    const originalSuccess = strategy.success;
    const originalFail = strategy.fail;
    const originalError = strategy.error;

    strategy.success = (user) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(new Error("Should not authenticate"));
    };

    strategy.fail = (info) => {
      expect(info.message).toBe("Email is not registered");

      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done();
    };

    strategy.error = (err) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(err);
    };

    strategy.authenticate(req);
  });

  it("should fail with incorrect password", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("rightpassword", 10),
    };

    // Mock DB query to return user
    mockQuery.mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [mockUser] });
    });

    const strategy = passport._strategies.local;

    const req = {
      body: { email: mockUser.email, password: "wrongpassword" },
    };

    // Override strategy methods for testing
    const originalSuccess = strategy.success;
    const originalFail = strategy.fail;
    const originalError = strategy.error;

    strategy.success = (user) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(new Error("Should not authenticate"));
    };

    strategy.fail = (info) => {
      expect(info.message).toBe("Password not correct!");

      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done();
    };

    strategy.error = (err) => {
      // Restore original methods
      strategy.success = originalSuccess;
      strategy.fail = originalFail;
      strategy.error = originalError;

      done(err);
    };

    strategy.authenticate(req);
  });
});
