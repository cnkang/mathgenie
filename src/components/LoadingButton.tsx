import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => Promise<void> | void;
  loadingContent: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loadingContent,
  disabled,
  children,
  ...props
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button {...props} disabled={disabled || isLoading} onClick={handleClick}>
      {isLoading ? loadingContent : children}
    </button>
  );
};

export default LoadingButton;
