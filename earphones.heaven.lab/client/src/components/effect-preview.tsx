import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EffectPreviewProps {
  speed: number;
  isActive: boolean;
}

export default function EffectPreview({ speed, isActive }: EffectPreviewProps) {
  const effectStatus = isActive ? 'Effect: Active' : 'Effect: Ready';

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center text-foreground">
          <Eye className="w-5 h-5 text-accent-blue mr-3" />
          8D Effect Preview
        </h4>
        
        <div className="relative h-32 bg-background rounded-lg overflow-hidden border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-20 h-20">
              {/* Outer circle track */}
              <div className="absolute inset-0 border-2 border-border rounded-full"></div>
              
              {/* Center point */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-muted-foreground/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Moving 8D point */}
              <div 
                className={`absolute w-3 h-3 bg-accent-blue rounded-full shadow-lg ${speed > 0 ? 'animate-rotate-8d' : ''}`}
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  animationDuration: speed > 0 ? `${2 / speed}s` : '2s',
                  boxShadow: '0 0 10px rgba(0, 170, 255, 0.8)',
                  transform: speed > 0 ? undefined : 'translate(-50%, -50%)'
                }}
                data-testid="effect-preview-dot"
              />
              
              {/* Direction indicators */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground font-bold">F</div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground font-bold">B</div>
              <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-xs text-muted-foreground font-bold">L</div>
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-xs text-muted-foreground font-bold">R</div>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            <span data-testid="text-effect-status">{effectStatus}</span>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-accent-blue font-medium">
            {speed > 0 ? `${speed.toFixed(2)} Hz` : 'Stopped'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}