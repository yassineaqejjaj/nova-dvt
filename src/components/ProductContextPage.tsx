import { useProductContexts } from '@/components/context/useProductContexts';
import { ContextList } from '@/components/context/ContextList';
import { ContextEditor } from '@/components/context/ContextEditor';
import { ConfirmDeleteDialog } from '@/components/context/ConfirmDeleteDialog';

export const ProductContextPage = () => {
  const ctx = useProductContexts();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Contexte Produit Global</h1>
        <p className="text-muted-foreground">Gérez et réutilisez vos contextes produit à travers toute l'application</p>
      </div>

      <div className="flex flex-col gap-6">
        <ContextList
          contexts={ctx.contexts}
          isLoading={ctx.isLoading}
          selectedContextId={ctx.selectedContext?.id}
          searchQuery={ctx.searchQuery}
          onSearch={ctx.setSearchQuery}
          onSelect={ctx.handleSelectContext}
          onNew={ctx.handleNewContext}
          onSetActive={ctx.handleSetActive}
          onDelete={(id) => ctx.setDeleteContextId(id)}
        />

        <ContextEditor
          formData={ctx.formData}
          isSaving={ctx.isSaving}
          isEditing={ctx.isEditing}
          showHistory={ctx.showHistory}
          newObjective={ctx.newObjective}
          newKPI={ctx.newKPI}
          setFormData={ctx.setFormData}
          setIsEditing={ctx.setIsEditing}
          setShowHistory={ctx.setShowHistory}
          setNewObjective={ctx.setNewObjective}
          setNewKPI={ctx.setNewKPI}
          onSave={() => ctx.handleSave(false)}
          onAddObjective={ctx.handleAddObjective}
          onRemoveObjective={ctx.handleRemoveObjective}
          onAddKPI={ctx.handleAddKPI}
          onRemoveKPI={ctx.handleRemoveKPI}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!ctx.deleteContextId}
        onOpenChange={(open) => { if (!open) ctx.setDeleteContextId(null); }}
        onConfirm={ctx.handleDeleteContext}
      />
    </div>
  );
};
