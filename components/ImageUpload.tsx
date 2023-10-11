"use client";
import { useEffect, useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";

interface ImageUploadProps {
	value: string;
	onChange: (src: string) => void;
	disabled?: boolean;
}

export const ImageUpload = ({
	value,
	onChange,
	disabled,
}: ImageUploadProps) => {
	const [isMounted, setISMounted] = useState(false);

	// este hook se ejecuta cuando el componente se monta en el lado del servidor
	// y llega a la parte del cliente
	useEffect(() => {
		setISMounted(true);
	}, []);

	// asi si el componente no esta montado no se ejecuta el codigo de abajo
	// esto ya que cloudinary
	// nada del code de abajo va a ser capaz de causar errores de hidratacion
	if (!isMounted) return null;

	return (
		<div>
			<CldUploadButton
				options={{ maxFiles: 1 }}
				uploadPreset="w17tqrgj"
				onUpload={(result: any) => onChange(result.info.secure_url)}
			>
				<div className="p-4 border-4 border-dashed border-primary/10 rounded-lg hover:opacity-75 transition flex flex-col space-y-2 items-center justify-center">
					{/* border-dashed : para que el borde sea punteado */}
					<div className="relative h-40 w-40">
						<Image
							fill
							alt="Upload"
							src={value || "/placeholder.svg"}
							className="rounded-lg object-cover" // object-cover para que la imagen se ajuste al tamaño del contenedor
						/>
					</div>
				</div>
			</CldUploadButton>
		</div>
	);
};
