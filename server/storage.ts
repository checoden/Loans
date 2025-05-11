import { users, type User, type InsertUser, loans, type Loan, type InsertLoan } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getLoans(): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, Loan>;
  sessionStore: session.SessionStore;
  userCurrentId: number;
  loanCurrentId: number;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.userCurrentId = 1;
    this.loanCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add default admin user directly
    const adminId = this.userCurrentId++;
    const adminUser = {
      id: adminId,
      username: "admin",
      password: "admin123",
      isAdmin: true,
    };
    this.users.set(adminId, adminUser);
    console.log("Администратор создан:", adminUser);
    
    // Add some initial loans
    this.createLoan({
      name: "Займер",
      logo: "/api/logos/zaymer.svg",
      amount: 30000,
      term_from: 5,
      term_to: 30,
      rate: 0,
      is_first_loan_zero: true,
      link: "https://partnerlink.com/zaymer",
      priority: 1,
      approval_rate: 97,
    });
    
    this.createLoan({
      name: "МигКредит",
      logo: "/api/logos/migcredit.svg",
      amount: 100000,
      term_from: 7,
      term_to: 180,
      rate: 0.27,
      is_first_loan_zero: false,
      link: "https://partnerlink.com/migcredit",
      priority: 2,
      approval_rate: 93,
    });
    
    this.createLoan({
      name: "MoneyMan",
      logo: "/api/logos/moneyman.svg",
      amount: 80000,
      term_from: 5,
      term_to: 126,
      rate: 0,
      is_first_loan_zero: true,
      link: "https://partnerlink.com/moneyman",
      priority: 3,
      approval_rate: 95,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values())
      .sort((a, b) => a.priority - b.priority);
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanCurrentId++;
    const loan: Loan = { ...insertLoan, id };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: number, updateData: Partial<InsertLoan>): Promise<Loan | undefined> {
    const existingLoan = this.loans.get(id);
    if (!existingLoan) {
      return undefined;
    }
    
    const updatedLoan = { ...existingLoan, ...updateData };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }
}

export const storage = new MemStorage();
