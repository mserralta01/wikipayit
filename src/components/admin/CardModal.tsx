import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { PipelineItem, isPipelineLead, isPipelineMerchant, PipelineStatus } from "@/types/pipeline";
import { Button } from "@/components/ui/button";

export interface CardModalProps {
    item: PipelineItem;
    onClose: () => void;
    onStatusChange: (newStatus: PipelineStatus) => Promise<void>;
}

/**
 * Extracts the necessary data for display in the modal based on the item type.
 * @param item - The pipeline item (either Merchant or Lead).
 * @returns An object containing the title and email for display.
 */
function getModalData(item: PipelineItem): { title: string; email: string } {
    if (isPipelineMerchant(item)) {
        return {
            title: item.businessName,
            email: item.email,
        };
    } else if (isPipelineLead(item)) {
        return {
            title: item.companyName,
            email: item.email,
        };
    } else {
        // This should never happen if the type guards are used correctly
        return {
            title: "Unknown",
            email: "Unknown",
        };
    }
}

/**
 * A modal component to display details of a pipeline item.
 * @param item - The pipeline item (either Merchant or Lead).
 * @param onClose - A function to be called when the modal is closed.
 * @param onStatusChange - A function to be called when the status of the pipeline item is changed.
 */
export function CardModal({ item, onClose, onStatusChange }: CardModalProps) {
    const { title, email } = getModalData(item);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{email}</DialogDescription>
                </DialogHeader>
                {/* Add more details here based on the item type if needed */}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
