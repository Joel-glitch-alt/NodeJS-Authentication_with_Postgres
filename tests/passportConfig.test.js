const passport = require("passport");
const bcrypt = require("bcrypt");
const initialize = require("../passportConfig");
const { pool } = require("../dbConfig");

// Setup Passport
initialize(passport);

describe("Passport LocalStrategy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate with correct credentials", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 10),
    };

    // Mock DB query
    jest.spyOn(pool, "query").mockImplementation((sql, params, callback) => {
      if (sql.includes("SELECT * FROM users WHERE email")) {
        return callback(null, { rows: [mockUser] });
      }
    });

    const strategy = passport._strategies.local;

    strategy.authenticate(
      { body: { email: mockUser.email, password: "password123" } },
      {
        success: (user) => {
          expect(user.email).toBe(mockUser.email);
          done();
        },
        fail: (info) => done(info),
        error: (err) => done(err),
      }
    );
  });

  it("should fail when email is not registered", (done) => {
    jest.spyOn(pool, "query").mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [] }); // No user found
    });

    const strategy = passport._strategies.local;

    strategy.authenticate(
      { body: { email: "nonexistent@example.com", password: "whatever" } },
      {
        success: () => done("Should not authenticate"),
        fail: (info) => {
          expect(info.message).toBe("Email is not registered");
          done();
        },
        error: (err) => done(err),
      }
    );
  });

  it("should fail with incorrect password", (done) => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("rightpassword", 10),
    };

    jest.spyOn(pool, "query").mockImplementation((sql, params, callback) => {
      return callback(null, { rows: [mockUser] });
    });

    const strategy = passport._strategies.local;

    strategy.authenticate(
      { body: { email: mockUser.email, password: "wrongpassword" } },
      {
        success: () => done("Should not authenticate"),
        fail: (info) => {
          expect(info.message).toBe("Password not correct!");
          done();
        },
        error: (err) => done(err),
      }
    );
  });
});
