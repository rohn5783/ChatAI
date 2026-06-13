import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, quickLoginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Two-way binding handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form submission handler
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.email && !formData.email.includes('@')) newErrors.email = 'Please enter a valid email';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await loginUser(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message || error.err || 'An error occurred. Please try again.' });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick Sign In handler
  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      setErrors({});
      await quickLoginUser();
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message || error.err || 'Quick Login failed. Please try traditional login.' });
      console.error('Quick Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to Perplexity Workspace</p>
          </div>

          {/* Quick Authentication Button */}
          <div className="quick-auth-section">
            <button 
              type="button" 
              onClick={handleQuickLogin} 
              className="quick-auth-btn"
              disabled={loading}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Quick Sign In (One Click)
            </button>
          </div>

          <div className="auth-divider">or continue with email</div>

          <form onSubmit={handleLogin} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && <div className="error-alert">{errors.submit}</div>}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <a href="/register" className="auth-link">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
