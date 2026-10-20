import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage/ForgotPasswordPage';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage/EmailConfirmationPage';
import { ReleaseReviewPage } from './pages/ReleaseReviewPage/ReleaseReviewPage';

/**
 * Fluxo de autenticação: Login → Recuperação de Senha → Confirmação de Envio → Login.
 * Lógica idêntica à original do App.jsx (navegação por estado local via props) —
 * só foi movida para dentro deste componente para poder conviver com a rota nova
 * de /releases sem tocar em LoginPage/ForgotPasswordPage/EmailConfirmationPage.
 *
 * TODO: Substituir controle de estado local por roteamento definitivo via react-router-dom:
 * <Routes>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
 *   <Route path="/email-confirmacao" element={<EmailConfirmationPage />} />
 * </Routes>
 */
function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [recoveryEmail, setRecoveryEmail] = useState('');

  if (currentScreen === 'email-confirmation') {
    return (
      <EmailConfirmationPage
        email={recoveryEmail}
        onNavigateToLogin={() => {
          setCurrentScreen('login');
          setRecoveryEmail('');
        }}
      />
    );
  }

  if (currentScreen === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => setCurrentScreen('login')}
        onNavigateToConfirmation={(email) => {
          setRecoveryEmail(email);
          setCurrentScreen('email-confirmation');
        }}
      />
    );
  }

  return (
    <LoginPage
      onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
    />
  );
}

/**
 * Componente raiz da aplicação.
 * /releases é uma rota isolada nova (tela de revisão humana de Release Notes);
 * qualquer outro caminho cai no fluxo de autenticação original, sem mudanças.
 */
function App() {
  return (
    <Routes>
      <Route path="/releases" element={<ReleaseReviewPage />} />
      <Route path="/*" element={<AuthFlow />} />
    </Routes>
  );
}

export default App;
