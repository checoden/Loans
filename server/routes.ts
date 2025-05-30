import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import "./types"; // Импортируем расширения типов сессии

// Setup multer for file uploads
const createLogoDir = () => {
  const dir = path.join(process.cwd(), "logos");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage_disk = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, createLogoDir());
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_disk,
  fileFilter: function (req, file, cb) {
    // Accept only images and SVGs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all loans with filtering
  app.get("/api/loans", async (req, res) => {
    try {
      const amount = req.query.amount ? parseInt(req.query.amount as string) : undefined;
      const term = req.query.term ? parseInt(req.query.term as string) : undefined;
      
      let loans = await storage.getLoans();
      
      // Apply filters if provided
      if (amount !== undefined) {
        loans = loans.filter(loan => loan.amount >= amount);
      }
      
      if (term !== undefined) {
        loans = loans.filter(loan => loan.term_from <= term && loan.term_to >= term);
      }
      
      res.json(loans);
    } catch (err) {
      res.status(500).json({ message: "Error fetching loans" });
    }
  });

  // Get single loan by ID
  app.get("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.getLoan(id);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(loan);
    } catch (err) {
      res.status(500).json({ message: "Error fetching loan" });
    }
  });

  // Simple admin login that doesn't use Passport
  app.post("/api/admin/login", async (req, res) => {
    console.log("Admin login attempt:", req.body);
    const { username, password } = req.body;
    
    if (username === "admin" && password === "admin123") {
      // Store admin authentication in session
      req.session.adminIsAuthenticated = true;
      res.json({
        id: 1,
        username: "admin",
        isAdmin: true
      });
    } else {
      res.status(401).send("Неверные учетные данные администратора");
    }
  });
  
  // Check admin auth status
  app.get("/api/admin/user", (req, res) => {
    if (req.session.adminIsAuthenticated) {
      res.json({
        id: 1,
        username: "admin",
        isAdmin: true
      });
    } else {
      res.status(401).send("Не авторизован");
    }
  });
  
  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.adminIsAuthenticated = false;
    res.sendStatus(200);
  });

  // Admin routes - protected by isAdmin middleware
  const isAdmin = (req: Request, res: Response, next: Function) => {
    // Check both regular auth and our custom admin auth
    if ((req.isAuthenticated && req.isAuthenticated() && req.user?.isAdmin) || req.session.adminIsAuthenticated) {
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }
  };

  // Create a new loan (admin only)
  app.post("/api/loans", isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const loanData = req.body;
      
      // Handle file upload
      if (req.file) {
        loanData.logo = `/api/logos/${req.file.filename}`;
      }
      
      // Convert numeric fields
      loanData.amount = parseInt(loanData.amount);
      loanData.term_from = parseInt(loanData.term_from);
      loanData.term_to = parseInt(loanData.term_to);
      loanData.rate = parseFloat(loanData.rate);
      loanData.priority = parseInt(loanData.priority);
      loanData.approval_rate = parseInt(loanData.approval_rate || "90");
      loanData.is_first_loan_zero = loanData.is_first_loan_zero === "true" || loanData.is_first_loan_zero === true;
      
      const loan = await storage.createLoan(loanData);
      res.status(201).json(loan);
    } catch (err) {
      res.status(500).json({ message: "Error creating loan" });
    }
  });

  // Update a loan (admin only)
  app.put("/api/loans/:id", isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loanData = req.body;
      
      // Handle file upload
      if (req.file) {
        loanData.logo = `/api/logos/${req.file.filename}`;
      }
      
      // Convert numeric fields if they exist
      if (loanData.amount) loanData.amount = parseInt(loanData.amount);
      if (loanData.term_from) loanData.term_from = parseInt(loanData.term_from);
      if (loanData.term_to) loanData.term_to = parseInt(loanData.term_to);
      if (loanData.rate) loanData.rate = parseFloat(loanData.rate);
      if (loanData.priority) loanData.priority = parseInt(loanData.priority);
      if (loanData.approval_rate) loanData.approval_rate = parseInt(loanData.approval_rate);
      if (loanData.is_first_loan_zero !== undefined) {
        loanData.is_first_loan_zero = loanData.is_first_loan_zero === "true" || loanData.is_first_loan_zero === true;
      }
      
      const updatedLoan = await storage.updateLoan(id, loanData);
      
      if (!updatedLoan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(updatedLoan);
    } catch (err) {
      res.status(500).json({ message: "Error updating loan" });
    }
  });

  // Delete a loan (admin only)
  app.delete("/api/loans/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLoan(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting loan" });
    }
  });

  // Serve logo files
  app.get("/api/logos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(createLogoDir(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "Logo not found" });
    }
    
    res.sendFile(filepath);
  });

  // Push notification endpoints - admin only
  app.post("/api/push-notification", isAdmin, async (req, res) => {
    try {
      const { title, message, url } = req.body;
      
      // Логирование для отладки
      console.log("Попытка отправки push-уведомления:");
      console.log("- title:", title);
      console.log("- message:", message);
      console.log("- url:", url);
      console.log("- APP_ID:", process.env.VITE_ONESIGNAL_APP_ID ? "Установлен" : "Отсутствует");
      console.log("- REST_API_KEY:", process.env.VITE_ONESIGNAL_REST_API_KEY ? "Установлен" : "Отсутствует");
      
      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }
      
      if (!process.env.VITE_ONESIGNAL_APP_ID || !process.env.VITE_ONESIGNAL_REST_API_KEY) {
        return res.status(400).json({ 
          message: "OneSignal credentials are not configured", 
          details: {
            appId: process.env.VITE_ONESIGNAL_APP_ID ? "Present" : "Missing",
            apiKey: process.env.VITE_ONESIGNAL_REST_API_KEY ? "Present" : "Missing"
          }
        });
      }
      
      // Конфигурация для уведомления
      const notificationPayload = {
        app_id: process.env.VITE_ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: {
          en: message,
          ru: message
        },
        headings: {
          en: title,
          ru: title
        },
        url: url || '',
        data: {
          notificationType: "general",
          url: url || null
        },
        // Настройки для Android
        android_accent_color: "FF9829",
        // Удаляем android_channel_id, поскольку он должен быть настроен в мобильном приложении,
        // а не при отправке уведомления. Для веб-уведомлений он не нужен.
        small_icon: "ic_stat_onesignal_default",
        priority: 10
      };
      
      console.log("Отправка запроса в OneSignal API...");
      
      try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.VITE_ONESIGNAL_REST_API_KEY}`
          },
          body: JSON.stringify(notificationPayload)
        });
        
        const data = await response.json();
        console.log("Ответ от OneSignal API:", JSON.stringify(data, null, 2));
        
        if (data.errors) {
          console.error("Ошибки при отправке уведомления:", data.errors);
          return res.status(400).json({ 
            message: "Error sending notification", 
            errors: data.errors 
          });
        }
        
        return res.json({ 
          success: true, 
          data
        });
      } catch (fetchError) {
        console.error("Ошибка при запросе к OneSignal API:", fetchError);
        return res.status(500).json({ 
          message: "Error connecting to OneSignal API", 
          error: fetchError instanceof Error ? fetchError.message : String(fetchError)
        });
      }
    } catch (err) {
      console.error("Error in push notification handler:", err);
      return res.status(500).json({ 
        message: "Error processing push notification request",
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // Get OneSignal configuration
  app.get("/api/push-notification/config", (req, res) => {
    res.json({
      appId: process.env.VITE_ONESIGNAL_APP_ID || '',
      hasApiKey: !!process.env.VITE_ONESIGNAL_REST_API_KEY,
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
