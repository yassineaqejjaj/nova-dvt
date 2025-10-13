import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfidentialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfidentialityDialog: React.FC<ConfidentialityDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDialogTitle>Attention : Données Confidentielles</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              Avant de télécharger ce document, veuillez confirmer :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Vous avez le consentement explicite du client pour utiliser ces données</li>
              <li>Les informations ne contiennent pas de données personnelles sensibles non autorisées</li>
              <li>Vous respectez les règles RGPD et les politiques de confidentialité</li>
              <li>Le document est anonymisé si nécessaire</li>
            </ul>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mt-3">
              ⚠️ L'utilisation de données clients sans consentement peut entraîner des sanctions légales
              et violer les réglementations sur la protection des données.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700">
            Je confirme avoir le consentement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
