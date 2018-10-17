export interface MePackInterface {
    pack_id: number;
    pack_name: string;
    pack_type: string;
    base_price: number;
    cgst_amount: number;
    sgst_amount: number;
    total_tax: number;
    total_amount: number;
    gst_applied: string;
    amount_type: string;
    active: string;
    dmlType: string;
    recordType: string;
    created_on: number;
    created_by: string;
    created_by_id:number;
    owner_id: number;
    modified_by: string;
    modified_on: string;
    modified_by_id: string;
    disabled_on: string;
    comments: string;
}

