"use client";

import axios from "axios";
import * as z from "zod"; //instalado cuando instalamos Form de shadcn
import { Catgory, Companion } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ImageUpload";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CompanionFormProps {
	initialData: Companion | null;
	categories: Catgory[];
}

const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;

const formSchema = z.object({
	name: z.string().min(1, {
		message: "Name is required",
	}),
	description: z.string().min(1, {
		message: "Description is required",
	}),
	instructions: z.string().min(200, {
		message: "Instructions rquire at least 200 characteres",
	}),
	seed: z.string().min(1, {
		message: "Seed is required",
	}),
	src: z.string().min(1, {
		message: "Image is required",
	}),
	categoryId: z.string().min(1, {
		message: "Category is required",
	}),
});

// when the companion already exists, initialData will be passed to the form from the page which is calling the API to get the companion and pass it to the companionForm
const CompanionForm = ({ initialData, categories }: CompanionFormProps) => {
	const router = useRouter();
	const { toast } = useToast();

	// el tipo de form es el que se le pasa a useForm el cual es inferido por zod de formSchema
	const form = useForm<z.infer<typeof formSchema>>({
		//validates the form using zod library
		resolver: zodResolver(formSchema),
		//object that contains the inicial values for the form fields
		defaultValues: initialData || {
			name: "",
			description: "",
			instructions: "",
			seed: "",
			src: "",
			categoryId: undefined,
		},
	});

	const isLoading = form.formState.isSubmitting; //indicar si el formulario a sido enviado o no

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			if (initialData) {
				// UPDATE companion functionality
				await axios.patch(`/api/companion/${initialData.id}`, values);
				toast({
					description: "Your companion was modified successfully",
				});
			} else {
				// CREATE companion functionality
				await axios.post("/api/companion", values);
				toast({
					description: "Your companion was created successfully",
				});
			}

			// para refrescar todos los componentes del servidor, refreshign the data from the database ensuring
			// to load this newest companion which we just created o edited
			router.refresh();
			router.push("/");
		} catch (err) {
			toast({
				variant: "destructive",
				description: "Something went wrong, please try again later",
			});
		}
	};

	return (
		// mx-auto : to center the form
		// max-w-3xl : to limit the width of the form
		<div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 pb-10"
				>
					<div className="space-y-2 w-full">
						<div>
							<h3 className="text-lg font-medium">General information</h3>
							<p className="text-sm text-muted-foreground">
								general information about your companion
							</p>
						</div>
						<Separator className="bg-primary/10" />
					</div>
					<FormField
						name="src"
						render={({ field }) => (
							<FormItem className="flex flex-col items-center justify-center space-y-4">
								<FormControl>
									<ImageUpload
										disabled={isLoading}
										// field.onChange : to update the value of the field once it is called in the ImageUpload component
										// value will be uploaded once the user uploads the image using then onChange function on the ImageUpload component
										onChange={field.onChange}
										value={field.value}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							name="name"
							control={form.control}
							render={({ field }) => (
								// col-span-2 : to make the field take the whole width of the form
								<FormItem className="col-span-2 md:col-span-1">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											disabled={isLoading}
											placeholder="Fox Stevenson"
											{...field} //...field agregara las demas propiedades de field a Input como onChange, onBlur, etc
										/>
									</FormControl>
									<FormDescription>
										This is how your IA companion will be named
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="description"
							control={form.control}
							render={({ field }) => (
								// col-span-2 : to make the field take the whole width of the form
								<FormItem className="col-span-2 md:col-span-1">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input
											disabled={isLoading}
											placeholder="Music producer & Exponent of drum&bass"
											{...field} //...field agregara las demas propiedades de field a Input como onChange, onBlur, etc
										/>
									</FormControl>
									<FormDescription>
										Short description for your AI companion
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="categoryId"
							control={form.control}
							render={({ field }) => (
								// col-span-2 : to make the field take the whole width of the form
								<FormItem className="col-span-2 md:col-span-1">
									<FormLabel>Category</FormLabel>
									<Select
										disabled={isLoading}
										onValueChange={field.onChange}
										value={field.value}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="">
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a category"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
										<FormDescription>
											Select a category for your companion
										</FormDescription>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="space-y-2 w-full">
						<div>
							<h3 className="text-lg font-medium">Configuration</h3>
							<p className="text-sm text-muted-foreground">
								Detailed instructions for AI behavior
							</p>
						</div>
						<Separator className="bg-primary/10" />
					</div>
					<FormField
						name="instructions"
						control={form.control}
						render={({ field }) => (
							<FormItem className="col-span-2 md:col-span-1">
								<FormLabel>Instructions</FormLabel>
								<FormControl>
									<Textarea
										className="bg-background resize-none"
										rows={7}
										disabled={isLoading}
										placeholder={PREAMBLE}
										{...field} //...field agregara las demas propiedades de field a Input como onChange, onBlur, etc
									/>
								</FormControl>
								<FormDescription>
									Describe in detail your companion&apos;s backstory and
									relevant details.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						name="seed"
						control={form.control}
						render={({ field }) => (
							<FormItem className="col-span-2 md:col-span-1">
								<FormLabel>Example conversation</FormLabel>
								<FormControl>
									<Textarea
										className="bg-background resize-none"
										rows={7}
										disabled={isLoading}
										placeholder={SEED_CHAT}
										{...field} //...field agregara las demas propiedades de field a Input como onChange, onBlur, etc
									/>
								</FormControl>
								<FormDescription>
									Describe in detail your companion&apos;s backstory and
									relevant details.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="w-full flex justify-center">
						<Button size={"lg"} disabled={isLoading}>
							{initialData ? "Edit your companion" : "Create your companion"}
							<Wand2 className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default CompanionForm;
