export interface AccountType
{
    id: string;
    name: string;
    label?: string;
}

export interface Address
{
    id: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: { id: string; name: string; };
    subdivision?: { id: string; name: string; };
}

export interface Membership
{
    id: string;
    memberOfId: string;
    memberId?: string;
    memberType: 'owner' | 'member';
    status?: string;
    profile?: { id: string; name: string; handle: string; avatarURL?: string; };
}

export interface Account
{
    id: string;
    ownerId: string;
    addressId?: string;
    accountTypeId?: string;
    status?: string;
    label?: string;
    allowsMembership?: boolean;
    accountType?: AccountType;
    address?: Address;
    memberships?: Membership[];
}
