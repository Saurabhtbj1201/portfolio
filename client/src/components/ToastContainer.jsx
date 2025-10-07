import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            marginTop: index > 0 ? '0.5rem' : '0'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
