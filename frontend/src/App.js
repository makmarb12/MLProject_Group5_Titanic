
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    Pclass: 2,
    Sex: 1, 
    Age: 24,
    SibSp: 0,
    Parch: 0,
    Fare: 30,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    () => window.localStorage.getItem('titanic-dashboard-favorite') === 'true'
  );
  const [currentView, setCurrentView] = useState('home');
  const [activeLandingSection, setActiveLandingSection] = useState('home');

  // Derived values
  const familySize = parseInt(formData.SibSp) + parseInt(formData.Parch) + 1;
  const isAlone = familySize === 1 ? 1 : 0;
  const TITANIC_AVERAGE_SURVIVAL = 38.38; // Historical baseline

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFavorite = () => {
    const nextIsFavorite = !isFavorite;
    window.localStorage.setItem('titanic-dashboard-favorite', String(nextIsFavorite));
    setIsFavorite(nextIsFavorite);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsAnimating(true);
    setResult(null);
    setCompareMode(false);
    
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        ...formData,
        FamilySize: familySize,
        IsAlone: isAlone
      });
      
      setTimeout(() => {
        setResult(response.data.probability);
        setIsAnimating(false);
      }, 600);
      
    } catch (error) {
      console.error("Prediction error:", error);
      alert("🔌 Connection Error\nEnsure Flask is running on port 5000");
      setIsAnimating(false);
    }
    setLoading(false);
  };

  const getConfidenceLabel = (value) => {
    if (value >= 80) return { text: 'Very High', emoji: '🟢' };
    if (value >= 60) return { text: 'High', emoji: '🔵' };
    if (value >= 40) return { text: 'Moderate', emoji: '🟡' };
    return { text: 'Low', emoji: '🔴' };
  };

  const generateInsight = () => {
    const reasons = [];
    if (formData.Sex === '1') reasons.push('Female (+28%)');
    if (formData.Pclass === '1') reasons.push('1st Class (+15%)');
    if (formData.Pclass === '2') reasons.push('2nd Class (+5%)');
    if (formData.Pclass === '3') reasons.push('3rd Class (-8%)');
    if (formData.Age < 12) reasons.push('Child (+10%)');
    if (formData.Age > 60) reasons.push('Senior (-5%)');
    if (formData.Fare > 50) reasons.push('High Fare (+5%)');
    if (formData.Fare < 10) reasons.push('Low Fare (-5%)');
    if (formData.IsAlone === 0) reasons.push('With Family (+5%)');
    if (formData.SibSp > 0 || formData.Parch > 0) reasons.push(`Family of ${familySize} (+3%)`);
    return reasons.length > 0 ? reasons.join(', ') : 'Baseline factors';
  };

  const navigationItems = [
    { id: 'prediction', label: 'Predict', icon: '⌁' },
    { id: 'analytics', label: 'Insights', icon: '◈' },
    { id: 'team', label: 'Team', icon: '♙' },
    { id: 'tasks', label: 'Tasks', icon: '☷' },
    { id: 'favorites', label: 'Favorites', icon: '★' },
  ];
  const viewTitles = {
    prediction: '🚢 Survival Probability Dashboard',
    analytics: '📊 Survival Insights',
    team: '👥 Group 5',
    tasks: '☷ Project Tasks',
    favorites: '⭐ Your Favorites',
  };

  const titanicImages = [
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/RMS_Titanic_3.jpg/1280px-RMS_Titanic_3.jpg',
      alt: 'RMS Titanic departing Southampton in 1912',
      caption: 'Southampton, April 1912',
    },
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/RMS_Titanic_ready_for_launch%2C_1911.jpg/1280px-RMS_Titanic_ready_for_launch%2C_1911.jpg',
      alt: 'RMS Titanic at its launch in Belfast in 1911',
      caption: 'The launch, Belfast 1911',
    },
  ];
  const landingNavigationItems = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'about', label: 'About', icon: 'ⓘ' },
    { id: 'gallery', label: 'Gallery', icon: '▧' },
    { id: 'crew', label: 'Crew', icon: '♙' },
    { id: 'contact', label: 'Contact', icon: '✉' },
  ];

  return (
    <div className="dashboard-container">
      {currentView === 'home' ? (
        <main className="titanic-landing">
          <section className="landing-hero" id="home" aria-labelledby="landing-title">
            <div className="hero-photo hero-photo-main">
              <img src={titanicImages[0].src} alt={titanicImages[0].alt} />
            </div>
            <div className="hero-photo hero-photo-detail">
              <img src={titanicImages[1].src} alt={titanicImages[1].alt} />
            </div>
            <div className="hero-shade" />
            <div className="ocean-wave ocean-wave-back" />
            <div className="ocean-wave ocean-wave-front" />
            <h1 id="landing-title">Titanic</h1>
          </section>

          <section className="landing-section landing-about" id="about">
            <p className="section-kicker">A story across the Atlantic</p>
            <h2>About the Titanic</h2>
            <p>
              RMS Titanic was a passenger liner whose 1912 voyage continues to
              inspire stories, research, and remembrance. This project pairs
              that history with a machine-learning exploration of passenger
              survival.
            </p>
          </section>

          <section className="landing-section gallery-section" id="gallery">
            <p className="section-kicker">From the archives</p>
            <h2>Gallery</h2>
            <div className="titanic-gallery">
              {titanicImages.map((image) => (
                <figure className="gallery-card" key={image.caption}>
                  <img src={image.src} alt={image.alt} loading="lazy" />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="landing-section crew-section" id="crew">
            <p className="section-kicker">The project team</p>
            <h2>Crew</h2>
            <p>
              A student machine-learning project by Group 5, exploring the
              passenger data behind Titanic survival predictions.
            </p>
          </section>

          <section className="landing-section contact-section" id="contact">
            <p className="section-kicker">Continue exploring</p>
            <h2>Contact</h2>
            <p>Visit the project dashboard to explore passenger survival predictions.</p>
            <button type="button" onClick={() => setCurrentView('prediction')}>
              Open the survival predictor
            </button>
          </section>
          <footer className="landing-footer">
            <nav className="landing-nav" aria-label="Footer navigation">
              {landingNavigationItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={activeLandingSection === item.id ? 'active' : ''}
                  aria-current={activeLandingSection === item.id ? 'location' : undefined}
                  onClick={() => setActiveLandingSection(item.id)}
                >
                  <span className="landing-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </footer>
        </main>
      ) : (
      <>
      <footer className="project-footer">
        <nav className="project-nav" aria-label="Project navigation">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={currentView === item.id ? 'page' : undefined}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>

      <main className="main-content">
        <header className="top-bar">
          <h1>{viewTitles[currentView]}</h1>
          <div className="top-bar-actions">
            <button type="button" className="landing-return-btn" onClick={() => setCurrentView('home')}>
              ← Titanic
            </button>
            <button
              type="button"
              className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
              aria-pressed={isFavorite}
              onClick={toggleFavorite}
            >
              <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </button>
            <div className="user-badge">✨ Student Project</div>
          </div>
        </header>

        {currentView === 'prediction' ? (
        <div className="content-grid">
          
          {/* ===== FORM SECTION ===== */}
          <section className="form-section">
            <h3>Passenger Configuration</h3>
            <form onSubmit={handlePredict}>
              <div className="input-grid">
                
                {/* Sex */}
                <div className="card-input">
                  <label title="Female passengers had ~74% survival rate vs ~19% for males">
                    Biological Sex
                  </label>
                  <select name="Sex" value={formData.Sex} onChange={handleChange}>
                    <option value="1">👩 Female</option>
                    <option value="0">👨 Male</option>
                  </select>
                </div>

                {/* Pclass */}
                <div className="card-input">
                  <label>
                    Passenger Class 
                    <span style={{color: '#6366f1', fontWeight: 600}}>#{formData.Pclass}</span>
                  </label>
                  <input 
                    type="range" 
                    name="Pclass" 
                    min="1" 
                    max="3" 
                    value={formData.Pclass} 
                    onChange={handleChange} 
                    className="slider"
                  />
                  <small>
                    {formData.Pclass === '1' ? '💎 First' : formData.Pclass === '2' ? '👜 Second' : '🎒 Third'}
                  </small>
                </div>

                {/* Age */}
                <div className="card-input">
                  <label>Age (Years)</label>
                  <input 
                    type="number" 
                    name="Age" 
                    value={formData.Age} 
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="e.g., 24"
                  />
                </div>

                {/* Fare */}
                <div className="card-input">
                  <label>Ticket Fare ($)</label>
                  <input 
                    type="number" 
                    name="Fare" 
                    value={formData.Fare} 
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 30.00"
                  />
                </div>

                {/* Siblings/Spouses */}
                <div className="card-input">
                  <label title="Number of siblings or spouses aboard the Titanic">
                    👫 Siblings / Spouses
                  </label>
                  <input 
                    type="number" 
                    name="SibSp" 
                    value={formData.SibSp} 
                    onChange={handleChange}
                    min="0"
                    max="10"
                    placeholder="0"
                  />
                  <small>
                    {formData.SibSp == 0 ? 'None' : `+${formData.SibSp} sibling/spouse`}
                  </small>
                </div>

                {/* Parents/Children */}
                <div className="card-input">
                  <label title="Number of parents or children aboard the Titanic">
                    👨‍👩‍👧 Parents / Children
                  </label>
                  <input 
                    type="number" 
                    name="Parch" 
                    value={formData.Parch} 
                    onChange={handleChange}
                    min="0"
                    max="10"
                    placeholder="0"
                  />
                  <small>
                    {formData.Parch == 0 ? 'None' : `+${formData.Parch} parent/child`}
                  </small>
                </div>

              </div>
              
              {/* Family Summary Card */}
              <div className="family-summary">
                <div className="summary-row">
                  <span><strong>👥 Total Family:</strong> {familySize}</span>
                  <span><strong>🚶 Alone:</strong> {isAlone ? '✅ Yes' : '❌ No'}</span>
                </div>
                {familySize > 4 && (
                  <small className="warning-text">
                    ⚠️ Large families had lower survival rates on Titanic
                  </small>
                )}
              </div>
              
              <button type="submit" className="action-btn" disabled={loading}>
                {loading ? '⏳ Processing...' : 'Run Prediction Engine'}
              </button>
            </form>
          </section>

          {/* ===== RESULT SECTION ===== */}
          <section className="result-section">
            {isAnimating ? (
              <div className="empty-state">
                <div style={{fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite'}}>🔮</div>
                <p><strong>Analyzing passenger data...</strong></p>
                <p style={{fontSize: '0.875rem', color: '#94a3b8'}}>Running Gradient Boosting model</p>
              </div>
            ) : result !== null ? (
              <div className={`status-card ${result > 50 ? 'high' : 'low'}`}>
                <div className="circle-meter">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${result}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="percentage">
                      {result.toFixed(1)}%
                    </text>
                  </svg>
                </div>
                
                <h3>
                  {result > 50 ? '🎉 Predicted to Survive' : '⚠️ High Fatality Risk'}
                </h3>
                <p>Based on Gradient Boosting Analysis</p>
                
                {/* Confidence Badge */}
                <div className="confidence-badge">
                  <span>{getConfidenceLabel(result).emoji}</span>
                  <strong>Confidence:</strong> {getConfidenceLabel(result).text}
                </div>
                
                {/* Historical Comparison Toggle */}
                <button onClick={() => setCompareMode(!compareMode)} className="compare-toggle-btn">
                  {compareMode ? '📊 Hide Historical Data' : '📊 Compare with Historical Data'}
                </button>

                {compareMode && (
                  <div className="comparison-box">
                    <div className="comparison-header">
                      <span>Passenger Probability</span>
                      <span>Historical Average (38.4%)</span>
                    </div>
                    <div className="comparison-bars">
                      <div className="bar-container">
                        <div className="bar-fill passenger" style={{ width: `${result}%` }}>
                          {result.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bar-container">
                        <div className="bar-fill average" style={{ width: '38.4%' }}>
                          38.4%
                        </div>
                      </div>
                    </div>
                    <p className="insight">
                      {result > TITANIC_AVERAGE_SURVIVAL ? '📈 +' : '📉 '}
                      {Math.abs(result - TITANIC_AVERAGE_SURVIVAL).toFixed(1)}% vs average due to: {generateInsight()}
                    </p>
                  </div>
                )}

                {/* Prediction Breakdown */}
                <details className="explainability-box">
                  <summary>💡 Why this prediction?</summary>
                  <ul>
                    <li className={formData.Sex === '1' ? 'positive' : 'negative'}>
                      Sex: {formData.Sex === '1' ? 'Female (+28%)' : 'Male (baseline)'}
                    </li>
                    <li className={formData.Pclass === '1' ? 'positive' : formData.Pclass === '3' ? 'negative' : ''}>
                      Class: {formData.Pclass === '1' ? '1st (+15%)' : formData.Pclass === '2' ? '2nd (+5%)' : '3rd (-8%)'}
                    </li>
                    <li>
                      Age: {formData.Age < 12 ? 'Child (+10%)' : formData.Age > 60 ? 'Senior (-5%)' : 'Adult (baseline)'}
                    </li>
                    <li>
                      Family: {familySize === 1 ? 'Traveling alone (-8%)' : `With ${familySize-1} family member(s) (+3%)`}
                    </li>
                  </ul>
                </details>

              </div>
            ) : (
              <div className="empty-state">
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}></div>
                <p><strong>Configure passenger data</strong></p>
                <p style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                  Adjust inputs and click "Run Prediction" to see survival probability
                </p>
              </div>
            )}
          </section>

        </div>
        ) : currentView === 'favorites' ? (
          <section className="favorites-view" aria-label="Saved favorites">
            {isFavorite ? (
              <article className="favorite-card">
                <div className="favorite-card-icon" aria-hidden="true">🚢</div>
                <div className="favorite-card-details">
                  <h2>Titanic Survival Probability Dashboard</h2>
                  <p>Passenger survival prediction tool</p>
                </div>
                <button
                  type="button"
                  className="favorite-open-btn"
                  onClick={() => setCurrentView('prediction')}
                >
                  Open dashboard
                </button>
              </article>
            ) : (
              <div className="empty-state">
                <p><strong>No favorites yet</strong></p>
                <p>Add the dashboard to your favorites to find it here.</p>
                <button
                  type="button"
                  className="favorite-open-btn"
                  onClick={() => setCurrentView('prediction')}
                >
                  Back to dashboard
                </button>
              </div>
            )}
          </section>
        ) : currentView === 'analytics' ? (
          <section className="project-view analytics-view">
            <h2>Historical Survival Overview</h2>
            <p className="project-view-intro">Compare your passenger prediction with the overall Titanic survival baseline.</p>
            <div className="overview-stat">
              <span className="overview-stat-value">{TITANIC_AVERAGE_SURVIVAL}%</span>
              <span className="overview-stat-label">Historical passenger survival average</span>
            </div>
            <div className="project-view-note">
              {result === null
                ? 'Run a passenger prediction from Home to see its result alongside the historical average.'
                : `Your latest passenger prediction is ${result.toFixed(1)}%, ${result >= TITANIC_AVERAGE_SURVIVAL ? 'above' : 'below'} the historical average.`}
            </div>
            <button type="button" className="favorite-open-btn" onClick={() => setCurrentView('prediction')}>
              Go to prediction
            </button>
          </section>
        ) : currentView === 'team' ? (
          <section className="project-view team-view">
            <div className="project-view-icon" aria-hidden="true">👥</div>
            <h2>Group 5</h2>
            <p className="project-view-intro">Machine learning project exploring passenger survival on the Titanic.</p>
            <div className="project-view-note">The team built this dashboard to explore passenger data and generate survival predictions.</div>
          </section>
        ) : currentView === 'tasks' ? (
          <section className="project-view tasks-view">
            <h2>Prediction workflow</h2>
            <p className="project-view-intro">Follow these steps to explore a passenger survival prediction.</p>
            <ol className="task-list">
              <li><span>1</span><div><strong>Enter passenger details</strong><p>Set class, age, fare, and family aboard.</p></div></li>
              <li><span>2</span><div><strong>Run the prediction</strong><p>Use the trained model to estimate survival probability.</p></div></li>
              <li><span>3</span><div><strong>Review the result</strong><p>Compare it with the historical average and inspect the factors.</p></div></li>
            </ol>
            <button type="button" className="favorite-open-btn" onClick={() => setCurrentView('prediction')}>
              Start a prediction
            </button>
          </section>
        ) : (
          <section className="project-view">
            <h2>Page not found</h2>
            <button type="button" className="favorite-open-btn" onClick={() => setCurrentView('prediction')}>
              Go to Home
            </button>
          </section>
        )}
      </main>
      </>
      )}
    </div>
  );
}
export default App;
