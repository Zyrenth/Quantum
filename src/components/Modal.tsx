'use client';

import { randomBytes } from 'crypto';

import { cva, VariantProps } from 'class-variance-authority';
import React, {
    BaseHTMLAttributes,
    createContext,
    isValidElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

import Button from '<{components}>/Button';

/**
 * @description Internal type for the modal object.
 * @private
 */
type ModalObject = {
    /**
     * @description The unique identifier for the modal.
     */
    id: string;
    /**
     * @description The modal component to render.
     */
    child: React.ReactElement<ModalProps>;
    /**
     * @description Whether the modal is dismissable.
     */
    dismissable?: boolean;
    /**
     * @description Whether the modal is open.
     */
    isOpen: boolean;
    /**
     * @description Whether the modal is closing.
     */
    isClosing?: boolean;
};

/**
 * @description A context that provides the ability to push and pop modals.
 * @example
 * const { pushModal, popModal } = useContext(ModalContext);
 * const modalId = pushModal(<Modal dismissible>Hello World!</Modal>);
 * popModal(modalId);
 */
const ModalContext = createContext({
    /**
     * @description Pushes a modal onto the modal stack. This will open the modal.
     * @param modal The modal to push onto the stack.
     * @returns The unique identifier for the modal.
     * @example const modalId = pushModal(<Modal dismissible>Hello World!</Modal>);
     */
    pushModal: (modal: React.ReactElement<ModalProps>): string => {
        modal;
        return '';
    },
    /**
     * @description Pops a modal from the modal stack. This will close the modal.
     * @param id The unique identifier for the modal to pop.
     * @example popModal(modalId);
     */
    popModal: (id: string) => {
        id;
    },
});

/**
 * @description A provider component that manages the state of modals.
 * @example
 * <ModalProvider>
 *    <App />
 * </ModalProvider>
 */
const ModalProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
    const wrapperId = 'quantum:modals-container';

    const [modalStack, setModalStack] = useState<ModalObject[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * @description Updates the state of a modal in the modal stack.
     * @param modals The current modal stack.
     * @param id The unique identifier for the modal to update.
     * @param newState The new state to apply to the modal.
     * @returns The updated modal stack.
     */
    const updateModalState = (modals: ModalObject[], id: string, newState: Partial<ModalObject>) => {
        const modalIndex = modals.findIndex((modal) => modal.id === id);
        if (modalIndex === -1) return modals;

        const updatedModals = [...modals];
        updatedModals[modalIndex] = { ...updatedModals[modalIndex], ...newState };
        return updatedModals;
    };

    /**
     * @description Pushes a modal onto the modal stack.
     * @param modal The modal to push onto the stack.
     * @returns The unique identifier for the modal.
     */
    const pushModal = (modal: React.ReactElement<ModalProps>) => {
        if (!isValidElement(modal)) throw new Error('Modal must be a valid React element');
        const id = randomBytes(16).toString('hex');

        setModalStack((modals) => {
            const updatedModalStack = [
                ...modals,
                {
                    id,
                    child: React.cloneElement(modal, { close: () => popModal(id) }),
                    isOpen: false,
                    isQueuedForClose: true,
                    dismissable: modal?.props?.dismissible ?? true,
                },
            ];

            setTimeout(
                () =>
                    setModalStack((modals) =>
                        updateModalState(modals, id, {
                            isOpen: true,
                            isClosing: false,
                            dismissable: modal?.props?.dismissible ?? true,
                        }),
                    ),
                0,
            );

            return updatedModalStack;
        });

        return id;
    };

    /**
     * @description Pops a modal from the modal stack.
     * @param id The unique identifier for the modal to pop.
     */
    const popModal = useCallback(
        (id: string) =>
            setModalStack((modals) => {
                const updatedModals = updateModalState(modals, id, {
                    isOpen: false,
                    isClosing: true,
                    dismissable: false,
                });

                // 0ms timeout works with 250ms transition but will be noticeable with larger values.
                setTimeout(() => setModalStack((modals) => modals.filter((modal) => modal.id !== id)), 0);

                return updatedModals;
            }),
        [],
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            const currentClosingModal = modalStack.findLast((modal) => modal.isClosing);
            if (currentClosingModal) return;

            const currentOpenModal = modalStack.findLast((modal) => modal.isOpen);
            currentOpenModal?.dismissable && popModal(currentOpenModal.id);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [modalStack, popModal]);

    useEffect(() => {
        setIsModalOpen(!!modalStack.find((modal) => modal.isOpen || (modal.isClosing && modalStack.length > 1)));
    }, [modalStack]);

    useEffect(() => {
        const wrapper = document.getElementById(wrapperId);

        function handleTab(event: KeyboardEvent) {
            if (event.key === 'Tab' && wrapper) {
                const firstLayerElements = Array.from(wrapper?.children ?? []).filter(
                    (el) => el.parentElement === wrapper,
                );

                firstLayerElements.forEach((modal) => {
                    if (!modal.contains(document.activeElement)) return;

                    const focusableElements = Array.from(
                        modal.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                        ),
                    ).filter((element) => !element.hasAttribute('disabled'));

                    const firstFocusableElement = focusableElements?.[0] as HTMLElement;
                    const lastFocusableElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

                    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
                        event.preventDefault();
                        firstFocusableElement.focus();
                    } else if (event.shiftKey && document.activeElement === firstFocusableElement) {
                        event.preventDefault();
                        lastFocusableElement.focus();
                    }
                });
            }
        }

        if (isModalOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';

        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [isModalOpen]);

    /**
     * @description The mapped modals ready for render.
     * @returns The mapped modals.
     */
    const mapModals = useMemo(() => {
        const modals = modalStack.map((modal) =>
            React.cloneElement(modal.child, {
                isOpen:
                    modalStack.findLast((modal) => modal.isOpen && !modal.isClosing)?.id === modal.id &&
                    !modal.isClosing &&
                    modal.isOpen,
                key: modal.id,
            }),
        );

        return modals;
    }, [modalStack]);

    return (
        <ModalContext.Provider value={{ pushModal, popModal }}>
            {children}
            <div
                id={wrapperId}
                className={cn(
                    'fixed inset-0 bg-black/75 z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all ease-out duration-[150ms]',
                    isModalOpen && 'opacity-100 pointer-events-auto',
                )}
                onClick={(event) => {
                    if (event.target !== event.currentTarget) return;

                    const currentClosingModal = modalStack.findLast((modal) => modal.isClosing);
                    if (currentClosingModal) return;

                    const currentOpenModal = modalStack.findLast((modal) => modal.isOpen);
                    currentOpenModal?.dismissable && popModal(currentOpenModal.id);
                }}
            >
                {mapModals}
            </div>
        </ModalContext.Provider>
    );
};

type Props = VariantProps<typeof modal>;
interface ModalProps extends Omit<BaseHTMLAttributes<HTMLDivElement>, 'size'>, Props {
    /**
     * @description Whether the modal is open.
     * @default true
     */
    isOpen?: boolean;
    /**
     * @description The size of the modal.
     * @default 'md'
     */
    dismissible?: boolean;
    /**
     * @description Closes the modal.
     */
    close?: () => void;
}

const modal = cva(
    [
        'absolute flex flex-col gap-2.5 shadow-lg z-[100] rounded-md transform transition-all ease-out duration-[150ms]',
        'bg-white dark:bg-black border border-black/15 dark:border-white/15',
    ],
    {
        variants: {
            /**
             * @description The size of the modal.
             * @default 'md'
             */
            size: {
                sm: 'p-3.5 text-xs',
                md: 'p-4 text-sm',
                lg: 'p-[18px] text-base',
                xl: 'p-5 text-base',
            },
            /**
             * @description The rounding of the modal.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-lg',
                md: 'rounded-xl',
                lg: 'rounded-2xl',
                xl: 'rounded-3xl',
            },
            /**
             * @description Whether the modal is open.
             * @default false
             */
            isOpen: {
                true: 'scale-100 opacity-100',
                false: 'scale-95 opacity-0',
            },
        },
        defaultVariants: {
            size: 'md',
            rounding: 'md',
            isOpen: false,
        },
    },
);

/**
 * @description A modal component that can be used to display content.
 * @example <Modal>Modal Content</Modal>
 * @requires ModalProvider
 * @requires ModalContext
 */
const Modal = React.memo(
    React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
        { children, className, isOpen = true, size, rounding, ...props },
        ref,
    ) {
        const role = props.role || 'dialog';
        delete props.role;
        const ariaLabel = props['aria-label'] || 'Modal';
        delete props['aria-label'];

        const defaultRef = ref ?? React.createRef<HTMLDivElement>();

        useEffect(() => {
            if (!('current' in defaultRef)) return;
            if (!isOpen) return;

            const focusableElements = Array.from(
                defaultRef?.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ) || [],
            ).filter((element) => !element.hasAttribute('disabled'));

            if (focusableElements.includes(document.activeElement as Element)) return;

            const firstFocusableElement = focusableElements?.[0] as HTMLElement;
            firstFocusableElement?.focus();
        }, [isOpen, defaultRef]);

        const modalClass = modal({ size, rounding, isOpen });

        return (
            <div
                ref={defaultRef}
                role={role}
                aria-label={ariaLabel}
                aria-disabled={!isOpen}
                className={cn(modalClass, className)}
                {...props}
            >
                {children}
            </div>
        );
    }),
);

interface AlertModalProps extends ModalProps {
    /**
     * @description The title of the alert modal.
     */
    title?: string;
    /**
     * @description The description of the alert modal.
     */
    description?: string;
    /**
     * @description The icon to display in the alert modal.
     */
    icon?: React.ReactNode;
    /**
     * @description The actions to display in the alert modal.
     */
    actions?: React.ReactNode;
    /**
     * @description Whether to show the close button in the alert modal.
     * @default true
     */
    showCloseButton?: boolean;
}

/**
 * @description An alert modal component that can be used to display alerts.
 * @example <AlertModal title="Hello, world!" description="This is an alert." />
 * @requires ModalProvider
 * @requires ModalContext
 * @requires Modal
 * @requires Button
 */
const AlertModal = ({
    title,
    description,
    icon,
    actions,
    showCloseButton = true,
    className,
    close,
    size,
    rounding,
    ...props
}: AlertModalProps) => {
    const ids = new LabelId();

    return (
        <Modal
            role="alertdialog"
            aria-labelledby={ids.create('title')}
            aria-describedby={ids.create('description')}
            className={cn('flex-row min-w-[512px] max-w-[512px]', className)}
            size={size as 'sm' | 'md' | 'lg' | 'xl'}
            rounding={rounding as 'sm' | 'md' | 'lg' | 'xl'}
            {...props}
        >
            {icon && (
                <div aria-hidden="true" className="p-[10.5px] bg-black/10 dark:bg-white/10 h-fit rounded-md">
                    {icon}
                </div>
            )}
            <div className="flex flex-col w-full">
                <h1 id={ids.get('title')} className="font-semibold text-lg">
                    {title}
                </h1>
                <p id={ids.get('description')} className="opacity-60">
                    {description}
                </p>
                <div className="flex flex-row gap-2.5 mt-2.5 w-full justify-end">
                    {showCloseButton && (
                        <Button
                            variant="outline"
                            size={size as 'sm' | 'md' | 'lg' | 'xl'}
                            rounding={rounding as 'sm' | 'md' | 'lg' | 'xl'}
                            onClick={close}
                            aria-label="Close"
                        >
                            Close
                        </Button>
                    )}
                    {actions}
                </div>
            </div>
        </Modal>
    );
};

Modal.displayName = 'Modal';
AlertModal.displayName = 'AlertModal';

export type { ModalProps };
export { AlertModal, Modal, ModalContext, ModalProvider };
