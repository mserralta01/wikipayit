import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { PipelineItem, isPipelineLead, isPipelineMerchant } from "@/types/pipeline";
import { Button } from "@/components/ui/button";

interface CardModalProps {
    item: PipelineItem;
    open: boolean;
    onClose: () => void;
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
 * @param open - A boolean indicating whether the modal is open.
 * @param onClose - A function to be called when the modal is closed.
 */
export function CardModal({ item, open, onClose }: CardModalProps) {
    const { title, email } = getModalData(item);

    return (
        <Dialog open={open} onOpenChange={onClose}>
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
