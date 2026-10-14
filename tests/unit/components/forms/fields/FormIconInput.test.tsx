/**
 * Icon Form Field Unit Tests
 *
 * An `icon` field rendered the way every form renders fields — through FieldGroupRenderer
 * inside a react-hook-form provider — and asserted on the form's own value.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FieldGroupRenderer } from '@/components/forms/renderers/FieldGroupRenderer';
import type { FormFieldConfig } from '@/components/forms/types/formConfig.types';

vi.mock( 'react-i18next', () => ( {
    useTranslation: () => ( { t: ( key: string ) => key } ),
} ) );

beforeAll( () =>
{
    // jsdom has no layout, so scrolling an element into view is not implemented.
    Element.prototype.scrollIntoView = vi.fn();
} );

const ICON_FIELD: FormFieldConfig = { name: 'icon', type: 'icon', props: { fallback: 'building' } };

/** A form holding one icon field, reporting its value on every change. */
function IconForm( { initial, onValue }: { initial?: string; onValue: ( value: unknown ) => void } )
{
    const methods = useForm( { defaultValues: { icon: initial } } );
    onValue( methods.watch( 'icon' ) );

    return (
        <FormProvider {...methods}>
            <FieldGroupRenderer fields={[ICON_FIELD]} formScope="company" />
        </FormProvider>
    );
}

describe( 'icon form field', () =>
{
    it( 'renders the picker with the form\'s value and its label', () =>
    {
        render( <IconForm initial="leaf" onValue={() => undefined} /> );

        const trigger = screen.getByRole( 'button', { name: 'shared.iconPicker.choose' } );
        expect( trigger.querySelector( 'svg.tabler-icon-leaf' ) ).not.toBeNull();
        expect( screen.getByText( 'forms.company.fields.icon' ) ).toBeInTheDocument();
    } );

    it( 'stores the chosen registry key in the form', async () =>
    {
        const onValue = vi.fn();
        render( <IconForm initial="leaf" onValue={onValue} /> );

        fireEvent.click( screen.getByRole( 'button', { name: 'shared.iconPicker.choose' } ) );
        fireEvent.click( await screen.findByRole( 'option', { name: 'icons.flower' } ) );

        await waitFor( () => expect( onValue ).toHaveBeenLastCalledWith( 'flower' ) );
    } );

    it( 'shows the fallback while the form holds no icon', () =>
    {
        render( <IconForm onValue={() => undefined} /> );

        const trigger = screen.getByRole( 'button', { name: 'shared.iconPicker.choose' } );
        expect( trigger.querySelector( 'svg.tabler-icon-building' ) ).not.toBeNull();
    } );
} );
