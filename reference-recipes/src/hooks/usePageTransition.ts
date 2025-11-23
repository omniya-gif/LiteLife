import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';

const paths = {
  step1: {
    unfilled: 'M 0 0 h 0 c 0 50 0 50 0 100 H 0 V 0 Z',
    inBetween: 'M 0 0 h 33 c -30 54 113 65 0 100 H 0 V 0 Z',
    filled: 'M 0 0 h 100 c 0 50 0 50 0 100 H 0 V 0 Z',
  },
  step2: {
    filled: 'M 100 0 H 0 c 0 50 0 50 0 100 h 100 V 50 Z',
    inBetween: 'M 100 0 H 50 c 28 43 4 81 0 100 h 50 V 0 Z',
    unfilled: 'M 100 0 H 100 c 0 50 0 50 0 100 h 0 V 0 Z',
  }
};

export function usePageTransition() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const overlayPath = document.querySelector('.overlay__path');
    if (!overlayPath) return;

    let isAnimating = false;

    const navigateWithTransition = (to: string) => {
      if (isAnimating) return;
      isAnimating = true;

      const timeline = gsap.timeline({
        onComplete: () => {
          navigate(to);
          isAnimating = false;
        }
      });

      timeline
        .set(overlayPath, {
          attr: { d: paths.step1.unfilled }
        })
        .to(overlayPath, { 
          duration: 0.8,
          ease: 'power3.in',
          attr: { d: paths.step1.inBetween }
        })
        .to(overlayPath, { 
          duration: 0.2,
          ease: 'power1',
          attr: { d: paths.step1.filled }
        })
        .set(overlayPath, { 
          attr: { d: paths.step2.filled }
        })
        .to(overlayPath, { 
          duration: 0.15,
          ease: 'sine.in',
          attr: { d: paths.step2.inBetween }
        })
        .to(overlayPath, { 
          duration: 1,
          ease: 'power4',
          attr: { d: paths.step2.unfilled }
        });
    };

    return () => {
      gsap.killTweensOf(overlayPath);
    };
  }, [navigate, location]);
}