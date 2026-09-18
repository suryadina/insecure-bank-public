import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

interface NewsArticle {
  id: number;
  title: string;
  date: string;
  content: string;
  type: 'announcement' | 'winner' | 'feature';
}


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'news' | 'about' | 'services' | 'faq'>('news');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Show welcome modal on first visit
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('insecure_bank_visited');
    if (!hasVisited) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('insecure_bank_visited', 'true');
    }
  }, []);

  // News articles in chronological order (oldest first)
  const newsArticles: NewsArticle[] = [
    {
      id: 1,
      title: "Insecure Bank Officially Launches - Easy & Fast Registration Now Available!",
      date: "2024-11-15",
      content: "We are excited to announce the official launch of Insecure Bank! Our revolutionary digital banking platform offers the easiest and fastest registration process in Indonesia. Register in just 3 simple steps: provide your details, verify your phone number, and set your PIN. Join thousands of satisfied customers who have already discovered the future of banking.",
      type: 'announcement'
    },
    {
      id: 2,
      title: "🎉 Welcome Bonus Alert: Get IDR 999,999 FREE!",
      date: "2024-12-01",
      content: "New customers rejoice! Every new registration now automatically receives IDR 999,999 as a welcome bonus directly deposited into your new savings account. No conditions, no minimum deposits required. Simply complete your registration and start banking with nearly 1 million rupiah in your account immediately!",
      type: 'announcement'
    },
    {
      id: 3,
      title: "Major Breakthrough: Multiple Account Support Now Live!",
      date: "2024-12-20",
      content: "Insecure Bank makes banking history! We're the first digital bank in Indonesia to offer unlimited multiple accounts per customer. Open savings accounts, checking accounts, and time deposits all from your mobile device. Manage your finances like never before with our groundbreaking multi-account system.",
      type: 'feature'
    },
    {
      id: 4,
      title: "Time Deposit Feature Launch - Earn Higher Returns!",
      date: "2025-01-10",
      content: "Maximize your savings with our new Time Deposit feature! Choose from 90, 180, 270, or 365-day terms with competitive interest rates up to 8% annually. Set your investment goals and watch your money grow with guaranteed returns. Available now for all Insecure Bank customers.",
      type: 'feature'
    },
    {
      id: 5,
      title: "🏆 May 2025 Monthly Winner Announced!",
      date: "2025-05-01",
      content: "🎉 Congratulations to Ahmad R*** (Phone: +628152739**) for being our May 2025 monthly winner! Ahmad has won IDR 50,000,000 credited directly to his account. Thank you for being a loyal Insecure Bank customer since our early days. The prize has been automatically deposited into his primary savings account.",
      type: 'winner'
    },
    {
      id: 6,
      title: "🏆 June 2025 Monthly Winner Announced!",
      date: "2025-06-01",
      content: "🎉 Our June 2025 monthly winner is Siti N*** (Phone: +628197324**) who has received IDR 30,000,000 as our monthly grand prize! Siti has been with us since our launch and continues to enjoy our premium banking services. She actively uses our multiple account features and time deposit investments.",
      type: 'winner'
    },
    {
      id: 7,
      title: "🏆 July 2025 Monthly Winner Announced!",
      date: "2025-07-01",
      content: "🎉 July 2025 brings us another winner! Congratulations to Budi S*** (Phone: +628164892**) for winning IDR 20,000,000 in our monthly customer appreciation program. Budi is an active user of our multiple account features and regularly invests in our time deposit products. The prize has been transferred successfully!",
      type: 'winner'
    }
  ];

  // Sort news articles by date (newest first for display)
  const sortedNews = [...newsArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const faqData = [
    {
      question: "How do I register for an account?",
      answer: "Registration is simple! Just click 'Customer Login' → 'Register', provide your phone number, KTP number, full name, date of birth, and upload a selfie. Verify your OTP, set your password and PIN, and you're done! You'll automatically receive IDR 999,999 as a welcome bonus."
    },
    {
      question: "Is there a registration fee?",
      answer: "No! Registration is completely FREE. In fact, we give you IDR 999,999 as a welcome bonus when you complete your registration."
    },
    {
      question: "How many accounts can I have?",
      answer: "You can open unlimited accounts! We support Savings, Checking, and Time Deposit accounts. Each account type serves different purposes for your financial needs."
    },
    {
      question: "What is the Time Deposit feature?",
      answer: "Time Deposits are fixed-term investments with guaranteed returns. Choose from 90, 180, 270, or 365-day terms with competitive interest rates up to 8% annually."
    },
    {
      question: "How do I transfer money?",
      answer: "Once logged in, go to the Transfer section, enter the recipient's account number, amount, and your PIN. Transfers are instant and secure."
    },
    {
      question: "What are the monthly winner prizes?",
      answer: "Every month, we select loyal customers to receive substantial cash prizes! Winners are announced on the 1st of each month. Prize amounts vary from IDR 20,000,000 to IDR 50,000,000. All active customers are automatically eligible."
    },
    {
      question: "Do I need to download a mobile app?",
      answer: "No download required! Our bank supports full mobile functionality directly through your web browser. Simply visit our website on your mobile device and enjoy all banking features without installing any app. Works on all smartphones and tablets."
    },
    {
      question: "How secure is my money and personal data?",
      answer: "Your Security, Guaranteed. We employ military-grade encryption, multi-factor authentication, and advanced fraud detection systems. Our security infrastructure is monitored 24/7 by cybersecurity experts. Any unauthorized access attempts are illegal and will be immediately reported to law enforcement authorities."
    },
    {
      question: "What should I do if I suspect unauthorized access?",
      answer: "Contact our security team immediately at security@insecurebank.com or call our 24/7 hotline. We take all security incidents seriously and work closely with law enforcement to prosecute any illegal activities. Your account will be secured and investigated promptly."
    }
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const renderWelcomeModal = () => {
    if (!showWelcomeModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowWelcomeModal(false)}>
        <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🎉 Welcome to Insecure Bank!</h2>
            <button className="modal-close" onClick={() => setShowWelcomeModal(false)}>×</button>
          </div>
          <div className="modal-content">
            <div className="welcome-message">
              <h3>🎉 Welcome to Insecure Bank!</h3>
              <div className="achievement-box">
                <div className="achievement-title">New Customer Bonus</div>
                <div className="achievement-description">Earn up to <strong>IDR 999,999</strong> on your first deposit</div>
              </div>
              <p>As part of our anniversary celebration, every new customer receives a welcome bonus of up to IDR 999,999 — deposited directly into your new savings account. No minimum deposit required.</p>
              <div className="welcome-features">
                <div className="welcome-feature">💳 Free account opening</div>
                <div className="welcome-feature">🛡️ Bank-grade security</div>
                <div className="welcome-feature">📱 24/7 mobile banking</div>
                <div className="welcome-feature">🎁 Welcome bonus included</div>
              </div>
              <p className="hint-terms">Terms and conditions apply. For more information, please refer to the official announcement on our website.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn primary" onClick={handleLogin}>
              Claim Your Bonus - Register Now!
            </button>
            <button className="modal-btn secondary" onClick={() => setShowWelcomeModal(false)}>
              Explore Homepage First
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsSection = () => (
    <div className="content-section">
      <h2>Latest News & Announcements</h2>
      <div className="news-grid">
        {sortedNews.map(article => (
          <div key={article.id} className={`news-card ${article.type}`}>
            <div className="news-header">
              <h3>{article.title}</h3>
              <span className="news-date">{new Date(article.date).toLocaleDateString('id-ID')}</span>
            </div>
            <p className="news-content">{article.content}</p>
            {article.type === 'winner' && (
              <div className="winner-badge">🏆 MONTHLY WINNER</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAboutSection = () => (
    <div className="content-section">
      <h2>About Insecure Bank</h2>
      <div className="about-content">
        <div className="about-card">
          <h3>Our Mission</h3>
          <p>To revolutionize digital banking in Indonesia by providing the fastest, easiest, and most rewarding banking experience. We believe banking should be simple, accessible, and beneficial for everyone.</p>
        </div>
        <div className="about-card">
          <h3>Why Choose Us?</h3>
          <ul>
            <li>🚀 Fastest registration in Indonesia (under 5 minutes)</li>
            <li>💰 IDR 999,999 welcome bonus for all new customers</li>
            <li>📱 Multiple account support on one platform</li>
            <li>🏆 Monthly prizes up to IDR 99,999,999</li>
            <li>💳 No hidden fees, transparent pricing</li>
            <li>🛡️ <strong>Your Security, Guaranteed</strong> - Military-grade protection</li>
          </ul>
        </div>
        <div className="about-card">
          <h3>Our History</h3>
          <p>Founded in late 2024, Insecure Bank quickly became Indonesia's fastest-growing digital bank. With over 10,000 satisfied customers and counting, we continue to innovate and provide exceptional banking services.</p>
        </div>
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <div className="content-section">
      <h2>Our Services</h2>
      <div className="services-grid">
        <div className="service-card">
          <h3>💰 Savings Account</h3>
          <p>Your primary account with no minimum balance requirement. Earn competitive interest and enjoy unlimited transactions.</p>
        </div>
        <div className="service-card">
          <h3>💳 Checking Account</h3>
          <p>Perfect for daily transactions with enhanced features for business and personal use.</p>
        </div>
        <div className="service-card">
          <h3>📈 Time Deposits</h3>
          <p>Fixed-term investments with guaranteed returns. Choose from 90 to 365-day terms with up to 8% annual interest.</p>
        </div>
        <div className="service-card">
          <h3>🔄 Instant Transfers</h3>
          <p>Transfer money instantly to any bank account in Indonesia. Fast, secure, and available 24/7.</p>
        </div>
        <div className="service-card">
          <h3>📊 Account Management</h3>
          <p>Manage multiple accounts from one dashboard. View balances, transaction history, and account details.</p>
        </div>
        <div className="service-card">
          <h3>📱 Mobile Banking</h3>
          <p>Full banking capabilities on your mobile device. Bank anywhere, anytime with our user-friendly interface.</p>
        </div>
        <div className="service-card security-card">
          <h3>🛡️ Advanced Security</h3>
          <p><strong>Your Security, Guaranteed.</strong> Our state-of-the-art security infrastructure protects your financial data with military-grade encryption. Any unauthorized access attempts are illegal and will be immediately reported to law enforcement authorities.</p>
        </div>
      </div>
    </div>
  );

  const renderFAQSection = () => (
    <div className="content-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'news':
        return renderNewsSection();
      case 'about':
        return renderAboutSection();
      case 'services':
        return renderServicesSection();
      case 'faq':
        return renderFAQSection();
      default:
        return renderNewsSection();
    }
  };

  return (
    <div className="homepage">
      {/* Welcome Modal */}
      {renderWelcomeModal()}
      
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>🏦 Insecure Bank</h1>
            <span className="tagline">We trust our customers, like they trust us</span>
          </div>
          <button className="login-btn" onClick={handleLogin}>
            Customer Login
          </button>
          {/* <button className="staff-login-btn" onClick={() => navigate('/cu5st0m3r-z3rv!c3sss')}>
            Staff Login
          </button> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to the Future of Banking</h1>
            <p className="hero-subtitle">
              🎉 Get IDR 999,999 FREE when you register! 
              Experience Indonesia's fastest registration process in under 5 minutes.
            </p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>5-Minute Registration</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💰</span>
                <span>IDR 999,999 Welcome Bonus</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Multiple Accounts</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <span>Security Guaranteed</span>
              </div>
            </div>
            <button className="cta-button" onClick={handleLogin}>
              Start Banking Now - Get Your Bonus!
            </button>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-menu">
            <li>
              <button
                className={activeSection === 'news' ? 'active' : ''}
                onClick={() => setActiveSection('news')}
              >
                📰 News & Updates
              </button>
            </li>
            <li>
              <button
                className={activeSection === 'about' ? 'active' : ''}
                onClick={() => setActiveSection('about')}
              >
                🏢 About Us
              </button>
            </li>
            <li>
              <button
                className={activeSection === 'services' ? 'active' : ''}
                onClick={() => setActiveSection('services')}
              >
                💼 Services
              </button>
            </li>
            <li>
              <button
                className={activeSection === 'faq' ? 'active' : ''}
                onClick={() => setActiveSection('faq')}
              >
                ❓ FAQ
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🏦 Insecure Bank</h3>
              <p>Indonesia's fastest growing digital bank with over 10,000 satisfied customers.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => setActiveSection('news')}>Latest News</button></li>
                <li><button onClick={() => setActiveSection('about')}>About Us</button></li>
                <li><button onClick={() => setActiveSection('services')}>Services</button></li>
                <li><button onClick={() => setActiveSection('faq')}>FAQ</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Customer Support</h4>
              <p>📧 support@insecurebank.com</p>
              <p>📞 1500-INSECURE (1500-467-3287)</p>
              <p>🕒 24/7 Customer Service</p>
            </div>
            <div className="footer-section">
              <h4>🛡️ Security Center</h4>
              <p><strong>Your Security, Guaranteed</strong></p>
              <p>🔒 Military-grade encryption</p>
              <p>🚨 security@insecurebank.com</p>
              <p>⚖️ Unauthorized access is illegal and will be prosecuted</p>
            </div>
            <div className="footer-section">
              <h4>Get Started</h4>
              <button className="footer-cta" onClick={handleLogin}>
                Register Now & Get IDR 999,999 FREE!
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024-2025 Insecure Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;