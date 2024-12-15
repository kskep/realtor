<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let clients = [];

	let showModal = false;
	let isSubmitting = false;
	let activeTab = 'basicInfo';

	let newProperty = {
		title: '',
		description: '',
		price: '',
		location: '',
		bedrooms: '',
		bathrooms: '',
		size: '',
		status: 'Available',
		type: 'House',
		clientId: null,
		features: {},
		featuredImage: '',
		images: []
	};

	let featuredImageFile = null;
	let galleryFiles = [];
	let featuredImagePreview = null;
	let galleryPreviews = [];

	const MAX_FILE_SIZE = 5 * 1024 * 1024;
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

	function validateFile(file) {
		if (!ALLOWED_TYPES.includes(file.type)) {
			throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
		}
		if (file.size > MAX_FILE_SIZE) {
			throw new Error('File size too large. Maximum size is 5MB.');
		}
	}

	function handleFeaturedImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			try {
				validateFile(file);
				featuredImageFile = file;
				const reader = new FileReader();
				reader.onload = (e) => {
					featuredImagePreview = e.target.result;
				};
				reader.readAsDataURL(file);
			} catch (error) {
				alert(error.message);
				event.target.value = '';
			}
		}
	}

	function handleGalleryImagesChange(event) {
		const files = Array.from(event.target.files);
		try {
			files.forEach((file) => validateFile(file));
			galleryFiles = [...galleryFiles, ...files];
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					galleryPreviews = [...galleryPreviews, e.target.result];
				};
				reader.readAsDataURL(file);
			});
		} catch (error) {
			alert(error.message);
			event.target.value = '';
		}
	}

	function removeGalleryImage(index) {
		galleryFiles = galleryFiles.filter((_, i) => i !== index);
		galleryPreviews = galleryPreviews.filter((_, i) => i !== index);
	}

	async function uploadImages() {
		const uploadPromises = [];

		if (featuredImageFile) {
			const formData = new FormData();
			formData.append('image', featuredImageFile);

			const featuredUploadPromise = fetch('/api/upload', {
				method: 'POST',
				body: formData
			}).then((res) => {
				if (!res.ok) throw new Error('Failed to upload featured image');
				return res.json();
			});

			uploadPromises.push(featuredUploadPromise);
		}

		for (const file of galleryFiles) {
			const formData = new FormData();
			formData.append('image', file);

			const uploadPromise = fetch('/api/upload', {
				method: 'POST',
				body: formData
			}).then((res) => {
				if (!res.ok) throw new Error('Failed to upload gallery image');
				return res.json();
			});

			uploadPromises.push(uploadPromise);
		}

		const results = await Promise.all(uploadPromises);
		return {
			featuredImage: results[0]?.url || '',
			galleryImages: results.slice(1).map((result) => result.url)
		};
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (isSubmitting) return;

		try {
			isSubmitting = true;

			if (!newProperty.title || !newProperty.price || !newProperty.location) {
				throw new Error('Please fill in all required fields');
			}

			const { featuredImage, galleryImages } = await uploadImages();

			const formattedProperty = {
				...newProperty,
				price: parseFloat(newProperty.price),
				bedrooms: parseInt(newProperty.bedrooms),
				bathrooms: parseInt(newProperty.bathrooms),
				size: parseFloat(newProperty.size),
				clientId: newProperty.clientId ? parseInt(newProperty.clientId) : null,
				featuredImage,
				images: galleryImages,
				features: {}
			};

			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formattedProperty)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to add property');
			}

			dispatch('propertyAdded');
			showModal = false;
			resetForm();
			alert('Property added successfully!');
		} catch (error) {
			console.error('Error:', error);
			alert(error.message);
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		newProperty = {
			title: '',
			description: '',
			price: '',
			location: '',
			bedrooms: '',
			bathrooms: '',
			size: '',
			status: 'Available',
			type: 'House',
			clientId: null,
			features: {},
			featuredImage: '',
			images: []
		};
		featuredImageFile = null;
		galleryFiles = [];
		featuredImagePreview = null;
		galleryPreviews = [];
	}

	function closeModal() {
		if (!isSubmitting) {
			showModal = false;
			resetForm();
		}
	}
</script>

<div class="text-right mb-4">
	<button
		class="btn btn-primary bg-blue-600 hover:bg-blue-700 border-none"
		on:click={() => (showModal = true)}
	>
		<svg class="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
			<path
				d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
			/>
		</svg>
		Add Property
	</button>
</div>
{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box bg-white">
			<div class="flex justify-between items-center mb-6 border-b pb-4">
				<h3 class="text-xl font-semibold text-gray-800">Add New Property</h3>
				<button class="btn btn-sm btn-ghost" on:click={closeModal}>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="tabs">
				<a
					class="tab tab-bordered text-black font-bold"
					class:tab-active={activeTab === 'basicInfo'}
					on:click={() => (activeTab = 'basicInfo')}
				>
					<span>Basic Info</span>
				</a>
				<a
					class="tab tab-bordered text-black font-bold"
					class:tab-active={activeTab === 'details'}
					on:click={() => (activeTab = 'details')}
				>
					<span>Details</span>
				</a>
				<a
					class="tab tab-bordered text-black font-bold"
					class:tab-active={activeTab === 'images'}
					on:click={() => (activeTab = 'images')}
				>
					<span>Images</span>
				</a>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-6 mt-4">
				{#if activeTab === 'basicInfo'}
					<!-- Basic Information -->
					<div class="card shadow-sm">
						<div class="card-body">
							<h4 class="card-title text-base text-gray-700">Basic Information</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Title*</span>
									</label>
									<input
										type="text"
										class="input input-bordered"
										placeholder="Enter property title"
										bind:value={newProperty.title}
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Location*</span>
									</label>
									<input
										type="text"
										bind:value={newProperty.location}
										class="input input-bordered w-full bg-white"
										required
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Price*</span>
									</label>
									<label class="input-group">
										<input
											type="number"
											bind:value={newProperty.price}
											class="input input-bordered w-full bg-white"
											required
											min="0"
											step="0.01"
										/>
									</label>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Type</span>
									</label>
									<select
										bind:value={newProperty.type}
										class="select select-bordered w-full bg-white"
									>
										<option value="House">House</option>
										<option value="Apartment">Apartment</option>
										<option value="Condo">Condo</option>
										<option value="Villa">Villa</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if activeTab === 'details'}
					<!-- Property Details -->
					<div class="card shadow-sm">
						<div class="card-body">
							<h4 class="card-title text-base text-gray-700">Property Details</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Bedrooms</span>
									</label>
									<input
										type="number"
										bind:value={newProperty.bedrooms}
										class="input input-bordered w-full bg-white"
										min="0"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Bathrooms</span>
									</label>
									<input
										type="number"
										bind:value={newProperty.bathrooms}
										class="input input-bordered w-full bg-white"
										min="0"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Size (sq ft)</span>
									</label>
									<input
										type="number"
										bind:value={newProperty.size}
										class="input input-bordered w-full bg-white"
										min="0"
									/>
								</div>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Status</span>
									</label>
									<select
										bind:value={newProperty.status}
										class="select select-bordered w-full bg-white"
									>
										<option value="Available">Available</option>
										<option value="Sold">Sold</option>
										<option value="Pending">Pending</option>
									</select>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Client</span>
									</label>
									<select
										bind:value={newProperty.clientId}
										class="select select-bordered w-full bg-white"
									>
										<option value={null}>No Client</option>
										{#each clients as client}
											<option value={client.id}>
												{client.firstName}
												{client.lastName}
											</option>
										{/each}
									</select>
								</div>
							</div>

							<div class="form-control mt-4">
								<label class="label">
									<span class="label-text text-gray-600">Description</span>
								</label>
								<textarea
									bind:value={newProperty.description}
									class="textarea textarea-bordered h-32 bg-white"
									placeholder="Enter property description..."
									required
								></textarea>
							</div>
						</div>
					</div>
				{/if}

				{#if activeTab === 'images'}
					<!-- Images -->
					<div class="card shadow-sm">
						<div class="card-body">
							<h4 class="card-title text-base text-gray-700">Property Images</h4>

							<!-- Featured Image -->
							<div class="space-y-6">
								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Featured Image</span>
										<span class="label-text-alt text-gray-400">(Max 5MB - JPEG, PNG, WebP)</span>
									</label>
									<div class="flex items-center gap-4">
										<input
											type="file"
											accept="image/jpeg,image/png,image/webp"
											class="file-input file-input-bordered w-full bg-white"
											on:change={handleFeaturedImageChange}
										/>
										{#if featuredImagePreview}
											<div class="relative">
												<img
													src={featuredImagePreview}
													alt="Featured preview"
													class="w-24 h-24 object-cover rounded-lg border border-gray-200"
												/>
												<button
													type="button"
													class="btn btn-circle btn-xs absolute -top-2 -right-2 bg-white hover:bg-gray-100 border border-gray-200"
													on:click={() => {
														featuredImagePreview = null;
														featuredImageFile = null;
													}}
												>
													<svg
														class="w-4 h-4 text-gray-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										{/if}
									</div>
								</div>

								<!-- Gallery Images -->
								<div class="form-control">
									<label class="label">
										<span class="label-text text-gray-600">Gallery Images</span>
										<span class="label-text-alt text-gray-400"
											>(Max 5MB each - JPEG, PNG, WebP)</span
										>
									</label>
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										multiple
										class="file-input file-input-bordered w-full bg-white"
										on:change={handleGalleryImagesChange}
									/>
								</div>

								{#if galleryPreviews.length > 0}
									<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
										{#each galleryPreviews as preview, index}
											<div class="relative">
												<img
													src={preview}
													alt="Gallery preview"
													class="w-full h-24 object-cover rounded-lg border border-gray-200"
												/>
												<button
													type="button"
													class="btn btn-circle btn-xs absolute -top-2 -right-2 bg-white hover:bg-gray-100 border border-gray-200"
													on:click={() => removeGalleryImage(index)}
												>
													<svg
														class="w-4 h-4 text-gray-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Form Actions -->
				<div class="flex justify-end gap-3 mt-6 pt-4 border-t">
					<button
						type="button"
						class="btn btn-ghost text-gray-600 hover:bg-gray-100"
						on:click={closeModal}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<span class="loading loading-spinner loading-sm"></span>
							Saving...
						{:else}
							Add Property
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	:global(.modal-box) {
		max-width: 80vw !important;
		width: 1200px !important;
		max-height: 90vh !important;
		background-color: #ffffff !important;
		padding: 2rem !important;
	}

	:global(.card) {
		background-color: #f8fafc !important;
		border: 1px solid #e2e8f0;
	}

	:global(.input),
	:global(.select),
	:global(.textarea),
	:global(.file-input) {
		background-color: #ffffff !important;
	}

	:global(.form-control .label-text) {
		font-weight: 500 !important;
	}

	:global(.card-body) {
		padding: 1.5rem !important;
	}
	.tab-content {
		overflow: hidden;
		transition: height 0.3s ease;
	}
	a.tab-active span {
		border-bottom: 4px solid #c2c2c2; /* Blue underline for active tab */
	}
</style>
