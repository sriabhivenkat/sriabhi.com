import { PhotoUrlsResponse, PhotoWithMetadata } from "../hooks/usePhotoStore";

// const baseUrl = process.env.NODE_ENV === 'development'
//   ? 'http://localhost:8080'
//   : 'https://home.sriabhi.com';

const baseUrl = "https://home.sriabhi.com"

export async function getAccessToken() {
  console.log("URL: ", process.env.API_BASE_URL)
  const res = await fetch('/api/access-token'); // hits your Next.js server, not Flask directly
  const data = await res.json();
  return { access_token: data.access_token };
}

export async function connectNewInstitution(item_id: string, plaid_access_token: string, institution_id: string, institution_name: string) {
    const { access_token } = await getAccessToken();

    const res_add_new_institution = await fetch(`${baseUrl}/api/v1/connect_new_institution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            item_id: item_id,
            access_token: plaid_access_token,
            institution_name: institution_name,
            institution_id: institution_id
        }),
    })

    if (res_add_new_institution.status !== 201) {
        throw new Error('Institution was not created properly');
    }

    if (!res_add_new_institution.ok) {
        throw new Error('Failed to add institution');
    }

    const data = await res_add_new_institution.json();

    return data;
}

export async function addInstitutionAccounts(item_id: string, institution_name: string) {
    const { access_token } = await getAccessToken();
    const res_institution_id = await fetch(`${baseUrl}/api/v1/get_institution?item_id=${item_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
    
    })
    const res_institution_id_json = await res_institution_id.json();
    console.log('res_institution_id_json', res_institution_id_json);

    const res_add_accounts = await fetch(`${baseUrl}/api/v1/add_institution_accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        
        body: JSON.stringify({
            item_id: item_id,
            access_token: res_institution_id_json.access_token,
            institution_name: res_institution_id_json.institution_name,
        }),
    })

    if (!res_add_accounts.ok) {
        throw new Error('Failed to add institution accounts');
    }

    return res_add_accounts.json();
}

export async function exchangePublicToken(public_token: string) {
    const { access_token } = await getAccessToken();
    console.log('access token', access_token);
    console.log('public token', public_token);
    const res_access_token = await fetch(`${baseUrl}/api/v1/plaid/exchange_public_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            public_token: public_token,
        }),
    })

    if (!res_access_token.ok) {
        throw new Error('Failed to fetch token');
    }

    const data = await res_access_token.json();
    console.log('access token data', data);
    
    return { access_token: data.access_token, item_id: data.item_id };
}

/**
 * Fetches photo URLs for a given subfolder path.
 */
export async function getPhotoUrls(subfolder: string, token: string, limit?: number): Promise<PhotoUrlsResponse> {
  try {
    const url = new URL(`${baseUrl}/api/v1/photo/list_photos`);
    url.searchParams.set('subfolder', subfolder);
    if (limit) url.searchParams.set('limit', String(limit));
    const resp = await fetch(
      url.toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!resp.ok) throw new Error(`Failed to fetch photos for ${subfolder}`);

    const data = await resp.json();
    const files = data.photos;

    // Convert backend response → frontend-friendly structure
    const formatted: PhotoWithMetadata[] = files.map((file: any) => ({
      url: file.file_url[0] == "/" ? `${baseUrl}${file.file_url}` : `${baseUrl}/${file.file_url}`,
      metadata: file.metadata || null,
    }));

    console.log(`Fetched photo metadata for ${subfolder}:`, formatted);

    return {
      photos: formatted,
      total: data.total,
      coverUrl: `${baseUrl}/${data.cover_url}`,
      lastUpdated: data.last_updated,
    };
  } catch (err) {
    console.error(`Error fetching photos for ${subfolder}:`, err);
    return { photos: [], total: 0, coverUrl: '', lastUpdated: '' };
  }
}

export async function fetchStravaAccessToken(): Promise<string> {
  const res = await fetch("/api/strava/token");

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch Strava token");
  }

  const data = await res.json();
  return data.access_token;
}

export async function subscribeToBlog(email: string, firstName: string) {
  const { access_token } = await getAccessToken();
  const resp = await fetch(
      `${baseUrl}/api/v1/subscribe_to_blog`,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          firstName
        }),
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
  );

  if (!(resp.status === 201 || resp.status === 200)) {
    const error = await resp.json();
    throw new Error(error.error || "Something went wrong");
  }

  const data = await resp.json();
  return {
    "status": data.status
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${baseUrl}/api/v1/request_access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Wrong password. Try again!");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}

export function getStoredAccessToken() {
  return localStorage.getItem("access_token");
}

export async function getCollections(): Promise<{ name: string; grabPath: string }[]> {
  try {
    const res = await fetch('/api/get-collections', {method: "GET"});
    return res.json();
  } catch (e) {
    console.log("ERROR: ", e)
    return [
      {grabPath: "", name: ""}
    ]
  }
}

export async function getCovers(): Promise<{ file_path: string; sub_folder_name: string }[]> {
  try {
    const { access_token } = await getAccessToken();
    const res = await fetch('/api/get-covers', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.json();
  } catch (e) {
    console.error("ERROR fetching covers: ", e);
    return [];
  }
}