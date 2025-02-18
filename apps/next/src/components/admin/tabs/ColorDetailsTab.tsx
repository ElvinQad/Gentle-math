import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dispatch, SetStateAction } from 'react';

interface ColorFormData {
  name: string;
  hex: string;
  imageUrl: string;
  popularity: number;
}

interface ColorDetailsTabProps {
  formData: ColorFormData;
  setFormData: Dispatch<SetStateAction<ColorFormData>>;
}

export function ColorDetailsTab({ formData, setFormData }: ColorDetailsTabProps) {
  const handleChange = (field: keyof ColorFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="name" 
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter color name"
          required
          className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose a descriptive name for the color trend
        </p>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="hex"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Hex Color
        </Label>
        <div className="flex gap-3">
          <Input
            id="hex"
            value={formData.hex}
            onChange={(e) => handleChange('hex', e.target.value)}
            placeholder="#000000"
            required
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
              focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
          />
          <div
            className="w-10 h-10 rounded border border-[color:var(--border)]"
            style={{ backgroundColor: formData.hex || '#ffffff' }}
          />
        </div>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Enter a valid hex color code (e.g., #FF0000 for red)
        </p>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="popularity"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Popularity (%)
        </Label>
        <Input
          id="popularity"
          type="number"
          min="0"
          max="100"
          value={formData.popularity}
          onChange={(e) => handleChange('popularity', parseInt(e.target.value))}
          required
          className="bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Enter a value between 0 and 100 to indicate the color&apos;s popularity
        </p>
      </div>
    </div>
  );
} 