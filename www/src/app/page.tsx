'use client';

import Alert from '@/components/Alert';
import Avatar from '@/components/Avatar';
import AvatarGroup from '@/components/AvatarGroup';
import Badge from '@/components/Badge';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';
import Codeblock from '@/components/Codeblock';
import KBD from '@/components/KBD';
import Progress from '@/components/Progress';
import Radio from '@/components/Radio';
import Select from '@/components/Select';
import Slider from '@/components/Slider';
import Switch from '@/components/Switch';
import Tab from '@/components/Tab';
import TextInput from '@/components/TextInput';
import { P, Subtext } from '@/components/Typography';
import { cn } from '@/utils/class';
import { Space_Grotesk } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

const monoFont = Space_Grotesk({ subsets: ['latin'] });

export default function Home() {
    useEffect(() => {
        interface DisableInteraction {
            (element: HTMLElement): void;
        }

        const disableInteraction: DisableInteraction = (element) => {
            element.setAttribute('tabIndex', '-1');
            element.setAttribute('aria-hidden', 'true');
            element.style.pointerEvents = 'none';

            Array.from(element.children).forEach((child) => disableInteraction(child as HTMLElement));
        };

        const div = document.getElementById('showcase');
        if (div) {
            disableInteraction(div);
        }
    }, []);

    return (
        <div className="bg-white text-black dark:bg-black dark:text-white h-screen flex flex-col justify-center items-center">
            <div className="w-full h-full mx-auto border-b-[0.5px] border-black/15 dark:border-white/15">
                <div className="max-w-[1024px] w-full h-full mx-auto border-x-[0.5px] border-black/15 dark:border-white/15"></div>
            </div>
            <div className="max-w-[1024px] w-full h-full min-h-[512px] mx-auto border-x-[0.5px] border-black/15 dark:border-white/15 relative flex flex-col gap-2.5 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full flex flex-col gap-2.5 p-2.5 z-[999]">
                    <div className="flex flex-row w-full items-center">
                        <Image src="/logo.png" alt="Quantum logo" className="w-20 h-20" width={80} height={80} />
                        <h1 className={cn('text-4xl font-bold text-center mr-2.5', monoFont.className)}>Quantum</h1>
                        <Badge variant={'danger'} tone={'soft'}>
                            Alpha
                        </Badge>
                    </div>
                    <div className="flex flex-row w-full items-start gap-2.5 px-2.5">
                        <div className="flex flex-col w-full items-start gap-2.5 px-2.5">
                            <P className="text-black/75 dark:text-white/75 text-lg">
                                Quantum is a collection of modern react components made to be simple, fast, and easy to
                                use.
                            </P>
                            <div className="flex flex-wrap w-full items-start gap-2.5">
                                <Codeblock
                                    language="bash"
                                    content={`Coming soon to NPM.   `}
                                    hideHeader
                                    allowCopy
                                    showLineNumbers={false}
                                    className="w-full sm:w-auto"
                                />
                                <Link href="/" className="contents">
                                    <Button variant={'primary'} className="w-full sm:w-auto">
                                        View on GitHub
                                    </Button>
                                </Link>
                            </div>
                            <Subtext>Quantum Components and CLI are in alpha, expect breaking changes.</Subtext>
                        </div>
                        <div className="flex-col w-full items-start gap-2.5 px-2.5 hidden sm:flex"></div>
                    </div>
                </div>
                <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full bg-gradient-to-r from-white/100 from-[32%] to-white/0 dark:from-black/100 dark:to-black/0 z-50"></div>
                <div
                    id="showcase"
                    className="flex flex-col ml-auto h-full items-end justify-center gap-2.5 p-2.5 sm:opacity-100 opacity-0 transition-opacity duration-[250ms] select-none pointer-events-none"
                >
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Progress value={42} />
                        <Progress value={12} />
                        <Progress value={75} />
                        <Progress value={82} />
                        <Progress value={3} />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Alert variant={'danger'} tone={'soft'} description="Don't forget to star Quantum on GitHub!" />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Breadcrumb>
                            <BreadcrumbItem href="#">Home</BreadcrumbItem>
                            <BreadcrumbItem href="#">About us</BreadcrumbItem>
                            <BreadcrumbItem href="#">Our company</BreadcrumbItem>
                            <BreadcrumbItem href="#">Roles</BreadcrumbItem>
                            <BreadcrumbItem href="#">Internal</BreadcrumbItem>
                            <BreadcrumbItem
                                collapsedLinks={[
                                    { href: '#', label: 'Team' },
                                    { href: '#', label: 'Management' },
                                ]}
                            >
                                ...
                            </BreadcrumbItem>
                            <BreadcrumbItem href="#" active>
                                Contact
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Badge variant={'info'}>Info</Badge>
                        <Badge variant={'info'} tone={'soft'}>
                            Info
                        </Badge>
                        <Badge variant={'success'}>Success</Badge>
                        <Badge variant={'success'} tone={'soft'}>
                            Success
                        </Badge>
                        <Badge variant={'warning'}>Warning</Badge>
                        <Badge variant={'warning'} tone={'soft'}>
                            Warning
                        </Badge>
                        <Badge variant={'danger'}>Danger</Badge>
                        <Badge variant={'danger'} tone={'soft'}>
                            Danger
                        </Badge>
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Select
                            options={[
                                { type: 'item', id: 'option-1', label: 'Option 1' },
                                { type: 'item', id: 'option-2', label: 'Option 2' },
                            ]}
                        />
                        <Select options={[{ type: 'item', id: 'option', label: 'Quantum UI' }]} value="option" />
                        <Select options={[{ type: 'item', id: 'option', label: 'Early access' }]} value="option" />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <KBD keys={['control', 'C']} appearance={'glossy'} variant={'outline'} />
                        <KBD keys={['alt', 'F4']} />
                        <KBD keys={['shift', 'tab']} appearance={'glossy'} />
                        <KBD keys={['arrowup']} />
                        <KBD keys={['control', 'shift', 'esc']} variant={'outline'} />
                        <KBD keys={['capslock']} appearance={'glossy'} variant={'outline'} />
                        <KBD keys={['arrowdown']} appearance={'glossy'} />
                        <KBD keys={['enter']} />
                        <KBD keys={['arrowleft']} />
                        <KBD keys={['control', 'alt', 'delete']} appearance={'glossy'} />
                        <KBD keys={['backspace']} variant={'outline'} />
                        <KBD keys={['arrowright']} appearance={'glossy'} variant={'outline'} />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Button variant={'primary'}>Primary</Button>
                        <Button variant={'secondary'} appearance={'glossy'}>
                            Secondary
                        </Button>
                        <Button variant={'outline'}>Outlined</Button>
                        <Button variant={'info'} tone={'soft'}>
                            Info
                        </Button>
                        <Button variant={'success'} tone={'solid'}>
                            Success
                        </Button>
                        <Button variant={'warning'} tone={'soft'} disabled>
                            Warning
                        </Button>
                        <Button variant={'danger'} tone={'soft'} appearance={'glossy'}>
                            Danger
                        </Button>
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <TextInput placeholder={'Placeholder'} readOnly />
                        <TextInput placeholder={'Username'} defaultValue={'Hello world!'} readOnly />
                        <TextInput placeholder={'Quantum'} defaultValue={'Star on Github'} readOnly />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Tab
                            tabs={[
                                { id: 'tab-1', label: 'Tabs' },
                                { id: 'tab-2', label: 'are' },
                                { id: 'tab-4', label: 'cool.' },
                                { id: 'tab-5', label: 'This', disabled: true },
                                { id: 'tab-6', label: 'is' },
                                { id: 'tab-7', label: 'disabled', disabled: true },
                                { id: 'tab-8', label: 'and', disabled: true },
                                { id: 'tab-9', label: 'this' },
                                { id: 'tab-10', label: 'is', disabled: true },
                                { id: 'tab-11', label: 'not.' },
                            ]}
                            activeTab={'tab-4'}
                            onTabChange={() => null}
                        />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <Radio checked={false} />
                        <Switch checked={true} appearance={'glossy'} />
                        <Checkbox checked={true} />
                        <Radio checked={false} />
                        <Slider value={35} appearance={'glossy'} />
                        <Radio checked={false} appearance={'glossy'} />
                        <Switch checked={false} />
                        <Checkbox checked={true} />
                        <Radio checked={true} appearance={'glossy'} />
                        <Slider value={63} />
                        <Radio checked={false} appearance={'glossy'} />
                        <Switch checked={true} />
                        <Checkbox checked={false} appearance={'glossy'} />
                        <Radio checked={true} />
                    </div>
                    <div className="flex flex-row gap-2.5 justify-center items-center">
                        <AvatarGroup>
                            <Avatar src={'/full_logo.png'} alt="" fallback={'Q'} />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/138702965?s=200&v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar src={'/full_logo.png'} alt="" fallback={'Q'} />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/71086259?v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/138702965?s=200&v=4'}
                                alt=""
                                fallback={'Q'}
                            />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/146372978?s=200&v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar src={'/full_logo.png'} alt="" fallback={'Q'} />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/71086259?v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar src={'/full_logo.png'} alt="" fallback={'Q'} />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/138702965?s=200&v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar src={'/full_logo.png'} alt="" fallback={'Q'} />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/71086259?v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/138702965?s=200&v=4'}
                                alt=""
                                fallback={'Q'}
                            />
                            <Avatar
                                src={'https://avatars.githubusercontent.com/u/146372978?s=200&v=4'}
                                alt=""
                                fallback={'Z'}
                            />
                        </AvatarGroup>
                    </div>
                </div>
            </div>
            <div className="w-full h-full mx-auto border-t-[0.5px] border-black/15 dark:border-white/15">
                <div className="max-w-[1024px] w-full h-full mx-auto border-x-[0.5px] border-black/15 dark:border-white/15"></div>
            </div>
        </div>
    );
}
