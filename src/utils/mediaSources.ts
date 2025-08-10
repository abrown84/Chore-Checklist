// Media Sources Integration
// This file provides access to high-quality free media resources for the app

// Avatar Sources
export const AVATAR_SOURCES = {
  // DiceBear API - Professional avatar generation
  dicebear: {
    baseUrl: 'https://api.dicebear.com/7.x',
    styles: {
      avataaars: 'avataaars', // Cartoon style
      bottts: 'bottts',       // Robot style
      identicon: 'identicon', // Geometric style
      initials: 'initials',   // Initials style
      lorelei: 'lorelei',     // Abstract style
      micah: 'micah',         // Minimal style
      miniavs: 'miniavs',     // Mini style
      notoEmoji: 'notoEmoji', // Emoji style
      personas: 'personas',   // Realistic style
      shapes: 'shapes',       // Shape style
      thumbs: 'thumbs',       // Thumb style
      bigEars: 'big-ears',    // Big ears style
      bigSmile: 'big-smile',  // Big smile style
      croodles: 'croodles',   // Doodle style
      funEmoji: 'fun-emoji',  // Fun emoji style
      pixelArt: 'pixel-art',  // Pixel art style
    },
    getAvatarUrl: (style: string, seed: string, options?: Record<string, any>) => {
      const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;
      const params = new URLSearchParams({ seed, ...options });
      return `${baseUrl}?${params.toString()}`;
    }
  },
  
  // Boring Avatars - Simple geometric avatars
  boringAvatars: {
    baseUrl: 'https://source.boringavatars.com',
    getAvatarUrl: (name: string, variant: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' = 'marble', size: number = 120) => {
      return `https://source.boringavatars.com/${variant}/${size}/${encodeURIComponent(name)}`;
    }
  },
  
  // UI Faces - AI-generated faces
  uiFaces: {
    baseUrl: 'https://images.unsplash.com/photo-',
    getAvatarUrl: (seed: number) => {
      const photos = [
        '1507003211169-0a1dd7228f2d', // Professional man
        '1494790108755-2616b612b786', // Professional woman
        '1500648767791-00dcc994a43e', // Casual man
        '1438761681033-6461ffad8d80', // Casual woman
        '1472099645785-5658abf4ff4e', // Business man
        '1544005313-94ddf0286d2f',   // Business woman
        '1506794778202-cad84cf45f1d', // Creative man
        '1517841905240-472988babdf9', // Creative woman
        '1506794778202-cad84cf45f1d', // Artist man
        '1494790108755-2616b612b786'  // Artist woman
      ];
      return `https://images.unsplash.com/photo-${photos[seed % photos.length]}?w=150&h=150&fit=crop&crop=face`;
    }
  }
};

// Background Sources
export const BACKGROUND_SOURCES = {
  // Unsplash API - High-quality background images
  unsplash: {
    baseUrl: 'https://api.unsplash.com',
    categories: {
      nature: ['landscape', 'forest', 'ocean', 'mountains', 'sunset'],
      abstract: ['geometric', 'patterns', 'minimal', 'modern'],
      textures: ['wood', 'stone', 'fabric', 'metal', 'paper'],
      space: ['galaxy', 'stars', 'nebula', 'cosmos'],
      urban: ['city', 'architecture', 'street', 'building'],
      seasonal: ['spring', 'summer', 'autumn', 'winter']
    },
    getBackgroundUrl: (category: string, subcategory: string) => {
      // For demo purposes, using Unsplash source URLs
      const backgrounds = {
        nature: {
          landscape: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
          ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
          mountains: 'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          sunset: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        },
        abstract: {
          geometric: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
          patterns: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
          minimal: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
          modern: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop'
        },
        textures: {
          wood: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          stone: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          fabric: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          metal: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          paper: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
        },
        space: {
          galaxy: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
          stars: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
          nebula: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
          cosmos: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop'
        },
        urban: {
          city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          architecture: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          street: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
          building: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
        },
        seasonal: {
          spring: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
          summer: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          autumn: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          winter: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        }
      };
      
      const categoryBackgrounds = backgrounds[category as keyof typeof backgrounds];
      if (categoryBackgrounds && subcategory in categoryBackgrounds) {
        return categoryBackgrounds[subcategory as keyof typeof categoryBackgrounds];
      }
      return backgrounds.nature.landscape;
    }
  },
  
  // CSS Gradients - Beautiful gradient backgrounds
  gradients: {
    aurora: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    sunset: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    ocean: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    forest: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)',
    galaxy: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    fire: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
    rainbow: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)',
    holographic: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    neon: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
    cosmic: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)'
  }
};

// Icon Sources
export const ICON_SOURCES = {
  // Lucide React (already in your app)
  lucide: {
    baseUrl: 'https://lucide.dev',
    categories: {
      general: ['User', 'Star', 'Heart', 'Home', 'Settings'],
      actions: ['Play', 'Pause', 'Stop', 'Skip', 'Rewind'],
      objects: ['Book', 'Phone', 'Car', 'House', 'Tree'],
      nature: ['Sun', 'Moon', 'Cloud', 'Rain', 'Snow'],
      emotions: ['Smile', 'Frown', 'Angry', 'Surprised', 'Sad']
    }
  },
  
  // Additional icon sets
  additional: {
    // Emoji sets for different themes
    emoji: {
      nature: ['🌱', '🌿', '🌳', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🌻'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
      food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒'],
      activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸'],
      objects: ['📱', '💻', '⌚', '📷', '🎮', '📚', '✏️', '🎨', '🎭', '🎪']
    },
    
    // Custom SVG icons
    custom: {
      achievement: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      trophy: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      crown: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      star: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      diamond: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    }
  }
};

// Sound Sources
export const SOUND_SOURCES = {
  // Freesound.org - Free sound effects
  freesound: {
    baseUrl: 'https://freesound.org',
    categories: {
      notifications: ['success', 'error', 'warning', 'info'],
      achievements: ['levelup', 'unlock', 'reward', 'celebration'],
      ui: ['click', 'hover', 'select', 'confirm'],
      nature: ['rain', 'thunder', 'wind', 'birds', 'water'],
      music: ['piano', 'guitar', 'drums', 'strings', 'brass']
    },
    // Demo sound URLs (replace with actual Freesound API integration)
    getSoundUrl: (category: string, type: string) => {
      const sounds = {
        notifications: {
          success: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          error: 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
          warning: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          info: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        achievements: {
          levelup: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          unlock: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          reward: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          celebration: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        ui: {
          click: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          hover: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          select: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          confirm: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        }
      };
      
      const categorySounds = sounds[category as keyof typeof sounds];
      if (categorySounds && type in categorySounds) {
        return categorySounds[type as keyof typeof categorySounds];
      }
      return sounds.notifications.success;
    }
  },
  
  // Web Audio API - Generate sounds programmatically
  webAudio: {
    generateTone: (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine') => {
      return new Promise<AudioBuffer>((resolve) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        oscillator.onended = () => {
          audioContext.close();
          resolve(audioContext.createBuffer(1, 44100, 44100)); // Placeholder buffer
        };
      });
    }
  }
};

// Animation Sources
export const ANIMATION_SOURCES = {
  // CSS Animations (already in your app)
  css: {
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    ping: 'animate-ping',
    fade: 'animate-fade-in',
    slide: 'animate-slide-in',
    scale: 'animate-scale-in',
    rotate: 'animate-rotate-in'
  },
  
  // Lottie animations
  lottie: {
    baseUrl: 'https://assets.lottiefiles.com',
    animations: {
      celebration: 'https://assets.lottiefiles.com/packages/lf20_obhph3wh.json',
      loading: 'https://assets.lottiefiles.com/packages/lf20_p8bfn5to.json',
      success: 'https://assets.lottiefiles.com/packages/lf20_obhph3wh.json',
      error: 'https://assets.lottiefiles.com/packages/lf20_p8bfn5to.json',
      confetti: 'https://assets.lottiefiles.com/packages/lf20_obhph3wh.json'
    }
  },
  
  // Custom keyframe animations
  custom: {
    rainbow: 'animate-rainbow',
    glow: 'animate-glow',
    sparkle: 'animate-sparkle',
    float: 'animate-float',
    shake: 'animate-shake'
  }
};

// Media Utility Functions
export const MediaUtils = {
  // Generate random avatar
  getRandomAvatar: (style: string = 'avataaars') => {
    const seed = Math.random().toString(36).substring(7);
    return AVATAR_SOURCES.dicebear.getAvatarUrl(style, seed);
  },
  
  // Get background by theme
  getBackgroundByTheme: (theme: string) => {
    const themeMap: Record<string, string> = {
      nature: BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'landscape'),
      abstract: BACKGROUND_SOURCES.unsplash.getBackgroundUrl('abstract', 'geometric'),
      space: BACKGROUND_SOURCES.unsplash.getBackgroundUrl('space', 'galaxy'),
      urban: BACKGROUND_SOURCES.unsplash.getBackgroundUrl('urban', 'city'),
      seasonal: BACKGROUND_SOURCES.unsplash.getBackgroundUrl('seasonal', 'spring')
    };
    
    return themeMap[theme] || BACKGROUND_SOURCES.gradients.aurora;
  },
  
  // Play sound effect
  playSound: async (category: string, type: string) => {
    try {
      const audio = new Audio(SOUND_SOURCES.freesound.getSoundUrl(category, type));
      await audio.play();
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  },
  
  // Generate custom sound
  generateSound: async (frequency: number, duration: number) => {
    try {
      await SOUND_SOURCES.webAudio.generateTone(frequency, duration);
    } catch (error) {
      console.log('Sound generation failed:', error);
    }
  },
  
  // Get icon by category
  getIconByCategory: (category: string, index: number = 0) => {
    const icons = ICON_SOURCES.additional.emoji[category as keyof typeof ICON_SOURCES.additional.emoji];
    return icons ? icons[index % icons.length] : '⭐';
  }
};

// Export all sources for easy access
export default {
  AVATAR_SOURCES,
  BACKGROUND_SOURCES,
  ICON_SOURCES,
  SOUND_SOURCES,
  ANIMATION_SOURCES,
  MediaUtils
};
