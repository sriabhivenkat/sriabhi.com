"use client";
import React from "react";

type Params = {
	params: Promise<{
		id: string;
	}>;
};

// Placeholder fetch - replace with real data fetching logic
async function getPhoto(id: string) {
	// simulate fetch
	return {
		id,
		title: `Photo ${id}`,
		description: "A sample photo used as boilerplate.",
		url: "https://via.placeholder.com/800x600.png?text=Photo+Placeholder",
		createdAt: new Date().toISOString(),
	};
}

export default async function Page({ params }: Params) {
	const { id } = await params;
	const photo = await getPhoto(id);

	return (
		<main style={{ padding: 24, fontFamily: "Segoe UI, Roboto, sans-serif" }}>
			<section style={{ maxWidth: 900, margin: "0 auto" }}>
				<h1 style={{ marginBottom: 8 }}>{photo.title}</h1>
				<p style={{ color: "#666", marginTop: 0 }}>ID: {photo.id} • Created: {new Date(photo.createdAt).toLocaleString()}</p>

				<div style={{ marginTop: 16, border: "1px solid #e6e6e6", padding: 8 }}>
					<img src={photo.url} alt={photo.title} style={{ width: "100%", height: "auto", display: "block" }} />
				</div>

				<p style={{ marginTop: 12 }}>{photo.description}</p>

				<div style={{ marginTop: 20, display: "flex", gap: 8 }}>
					<button style={{ padding: "8px 12px", cursor: "pointer" }} onClick={() => alert("Edit action - implement")}>Edit</button>
					<button style={{ padding: "8px 12px", cursor: "pointer" }} onClick={() => confirm("Delete this photo?") && alert("Deleted - implement")}>Delete</button>
				</div>
			</section>
		</main>
	);
}
