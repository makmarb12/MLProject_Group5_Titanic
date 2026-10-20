import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

const openPredictionDashboard = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Open the survival predictor' }));
};

test('renders a Titanic landing page with section navigation and image gallery', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Titanic' })).toBeInTheDocument();
  const footerNav = screen.getByRole('navigation', { name: 'Footer navigation' });
  expect(footerNav.closest('footer')).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
  expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '#gallery');
  expect(screen.getByRole('link', { name: 'Crew' })).toHaveAttribute('href', '#crew');
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
  expect(screen.getAllByRole('img')).toHaveLength(4);

  openPredictionDashboard();
  expect(screen.getByRole('heading', { name: /survival probability dashboard/i })).toBeInTheDocument();
});

test('saves the dashboard and displays it in Favorites', () => {
  render(<App />);
  openPredictionDashboard();

  fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
  expect(window.localStorage.getItem('titanic-dashboard-favorite')).toBe('true');

  fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
  expect(screen.getByRole('heading', { name: /your favorites/i })).toBeInTheDocument();
  expect(screen.getByText('Titanic Survival Probability Dashboard')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /open dashboard/i }));
  expect(screen.getByRole('heading', { name: /survival probability dashboard/i })).toBeInTheDocument();
});

test('restores a saved favorite and allows it to be removed', () => {
  window.localStorage.setItem('titanic-dashboard-favorite', 'true');
  render(<App />);
  openPredictionDashboard();

  fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
  expect(screen.getByText('Titanic Survival Probability Dashboard')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /remove from favorites/i }));
  expect(window.localStorage.getItem('titanic-dashboard-favorite')).toBe('false');
  expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
});

test('navigates between the project sections', () => {
  render(<App />);
  openPredictionDashboard();

  const dashboardNav = screen.getByRole('navigation', { name: 'Project navigation' });
  expect(dashboardNav.closest('footer')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Insights' }));
  expect(screen.getByRole('heading', { name: /survival insights/i })).toBeInTheDocument();
  expect(screen.getByText(/38\.38%/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Team' }));
  expect(screen.getByRole('heading', { name: 'Group 5' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
  expect(screen.getByRole('heading', { name: /prediction workflow/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Predict' }));
  expect(screen.getByRole('heading', { name: /passenger configuration/i })).toBeInTheDocument();
});
